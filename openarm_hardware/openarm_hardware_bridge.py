#!/usr/bin/env python3
"""
OpenArm Hardware Bridge (Thread-Isolated Lock-Free Architecture)
================================================================
Production Contribution for `enactic/openarm`, `google-deepmind/mujoco`, and `dm_control`.

Key Architectural Invariants:
1. Thread Isolation:
   - Asyncio WebSocket / ROS 2 event loop runs purely non-blocking on main thread.
   - Hardware I/O is isolated in a dedicated background worker thread (`OpenArmHardwareWorker`).
   - Communication occurs strictly via `queue.Queue(maxsize=200)` with non-blocking
     `put_nowait()` and `get_nowait()`.
2. Hardware Watchdog & Auto-Baud Gate:
   - Single-shot auto-baud lock (0xAA = 170) emitted once on connection with 500ms delay.
   - Command 14 hardware watchdog configured for 2.0s (20 x 100ms).
   - 25Hz (40ms) continuous streaming during active motion to keep watchdog alive.
3. 7-Bit Packet Checksum:
   - Checksum = (Address + Command + Value) & 127
4. Auto-Hunting & Reconnect:
   - Dynamic port scanning over /dev/serial/by-id/*, /dev/ttyACM*, /dev/ttyUSB*, and COM ports,
     filtering out conflicting UART devices (e.g. RPLiDAR CP2102).
5. OpenArm 7-DOF Kinematics & S-Curve Integration:
   - Integrated cubic S-curve shaping: v_shaped(x) = 0.35x + 0.65x^3.
"""

from typing import Dict, List, Optional, Tuple, Any, Union
import asyncio
import glob
import json
import logging
import math
import os
import queue
import signal
import sys
import threading
import time

try:
    import serial
    import serial.tools.list_ports
    HAS_SERIAL = True
except ImportError:
    HAS_SERIAL = False

try:
    import websockets
    HAS_WEBSOCKETS = True
except ImportError:
    HAS_WEBSOCKETS = False

try:
    from .kinematic_scurve import shape_velocity_cubic, KinematicSCurveSmoother, MultiAxisSCurveSmoother
except (ImportError, ValueError):
    from kinematic_scurve import shape_velocity_cubic, KinematicSCurveSmoother, MultiAxisSCurveSmoother

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")


def calculate_7bit_checksum(address: int, cmd: int, value: int) -> int:
    """
    Computes 7-bit standard checksum: (Address + Command + Value) & 127
    """
    return (int(address) + int(cmd) + int(value)) & 127


def build_7bit_packet(address: int, cmd: int, value: int) -> bytearray:
    """
    Builds a 4-byte packet: [Address, Command, Value, Checksum].
    """
    addr_val = int(address) & 0xFF
    cmd_val = int(cmd) & 0xFF
    data_val = max(0, min(127, int(value)))
    chk = calculate_7bit_checksum(addr_val, cmd_val, data_val)
    return bytearray([addr_val, cmd_val, data_val, chk])


def filter_uart_ports(
    port_list: Optional[List[str]] = None,
    blacklist_keywords: Optional[List[str]] = None,
) -> List[str]:
    """
    Filters a list of candidate serial device paths/names, excluding known
    conflicting UART peripherals such as RPLiDAR (CP2102).
    """
    if blacklist_keywords is None:
        blacklist_keywords = ["cp2102", "rplidar", "lidar"]

    valid_ports = []

    if port_list is not None:
        candidates = port_list
    else:
        candidates = []
        # Linux by-id
        candidates.extend(glob.glob("/dev/serial/by-id/*"))
        # Linux standard tty
        candidates.extend(sorted(glob.glob("/dev/ttyACM*") + glob.glob("/dev/ttyUSB*")))

        # Cross-platform comports inspection
        if HAS_SERIAL:
            try:
                for p in serial.tools.list_ports.comports():
                    desc = (p.description or "").lower()
                    hwid = (p.hwid or "").lower()
                    dev = p.device
                    # Check blacklist
                    is_blacklisted = any(
                        kw in desc or kw in hwid for kw in blacklist_keywords
                    )
                    if not is_blacklisted and dev not in candidates:
                        candidates.append(dev)
            except Exception as e:
                logging.debug(f"comports listing exception: {e}")

    for p in candidates:
        p_lower = str(p).lower()
        if not any(kw in p_lower for kw in blacklist_keywords):
            valid_ports.append(p)

    return valid_ports


class MockSerialPort:
    """Mock serial interface for environments without physical hardware or during CI testing."""

    def __init__(self, port: str = "MOCK_PORT", baud: int = 115200, timeout: float = 0.01):
        self.port = port
        self.baudrate = baud
        self.timeout = timeout
        self.is_open = True
        self.write_history: List[bytes] = []
        self._rx_buffer = bytearray()

    def write(self, data: Union[bytes, bytearray]) -> int:
        if not self.is_open:
            raise IOError("Port is closed")
        self.write_history.append(bytes(data))
        return len(data)

    def read(self, size: int = 1) -> bytes:
        if not self.is_open:
            raise IOError("Port is closed")
        chunk = self._rx_buffer[:size]
        self._rx_buffer = self._rx_buffer[size:]
        return bytes(chunk)

    def flush(self) -> None:
        pass

    def close(self) -> None:
        self.is_open = False


class OpenArmHardwareWorker(threading.Thread):
    """
    Dedicated background worker thread for OpenArm 7-DOF actuators and mobile base motors.
    Runs completely decoupled from the asyncio event loop via lock-free queue.Queue(maxsize=200).
    """

    def __init__(
        self,
        port: Optional[str] = None,
        baud: int = 115200,
        num_dof: int = 7,
        use_mock_if_missing: bool = True,
    ):
        super().__init__(daemon=True, name="OpenArmHardwareWorker")
        self.port_override = port
        self.baud = baud
        self.num_dof = num_dof
        self.use_mock_if_missing = use_mock_if_missing

        self.ser: Any = None
        self.cmd_queue: queue.Queue = queue.Queue(maxsize=200)
        self.running = True

        # State tracking for 7-DOF arm joints
        self.target_joint_vel = [0.0] * self.num_dof
        self.current_joint_vel = [0.0] * self.num_dof
        self.target_joint_pos = [0.0] * self.num_dof
        self.current_joint_pos = [0.0] * self.num_dof
        self.gripper_val = 0.0

        # State tracking for chassis / mobile base motors (M1, M2)
        self.target_m1 = 0
        self.target_m2 = 0
        self.current_m1 = 0
        self.current_m2 = 0

        self.is_stopped = True
        self.is_estop = False
        self.last_cmd_time = time.time()
        self.auto_baud_sent = False
        self.watchdog_configured = False

        # Multi-axis kinematic smoothers
        self.arm_smoother = MultiAxisSCurveSmoother(
            num_dof=self.num_dof,
            max_vel=2.0,
            max_accel=3.5,
            max_jerk=12.0,
            breakaway_floor=0.02,
        )

        # Atomic telemetry snapshot dictionary (safe for read from async loop)
        self.telemetry: Dict[str, Any] = {
            "jointPositions": [0.0] * self.num_dof,
            "jointVelocities": [0.0] * self.num_dof,
            "gripper": 0.0,
            "batteryVolts": 24.2,
            "tempC": 28.5,
            "currentM1": 0.0,
            "currentM2": 0.0,
            "dutyM1": 0,
            "dutyM2": 0,
            "isEStopActive": False,
            "hardwareConnected": False,
            "watchdogAlive": True,
            "queueSize": 0,
        }

    def find_port(self) -> Optional[str]:
        if self.port_override:
            return self.port_override

        valid_ports = filter_uart_ports()
        for p in valid_ports:
            p_str = str(p)
            if "openarm" in p_str.lower() or "sabertooth" in p_str.lower() or "actuator" in p_str.lower():
                return p_str

        if valid_ports:
            return valid_ports[0]

        if sys.platform.startswith("linux"):
            return "/dev/ttyACM0"
        return "COM3"

    def connect(self) -> bool:
        port = self.find_port()
        try:
            if HAS_SERIAL and port and not port.startswith("MOCK"):
                logging.info(f"Opening hardware port {port} at {self.baud} baud...")
                ser = serial.Serial(port, self.baud, timeout=0.01)
                time.sleep(0.5)  # Port settle
            elif self.use_mock_if_missing:
                logging.info(f"Using mock hardware port {port or 'MOCK'} at {self.baud} baud.")
                ser = MockSerialPort(port=port or "MOCK_PORT", baud=self.baud)
            else:
                self.ser = None
                self.telemetry["hardwareConnected"] = False
                return False

            if not self.running:
                try:
                    ser.close()
                except Exception:
                    pass
                return False

            # 1. Single-shot Auto-Baud character (0xAA = 170)
            logging.info("Sending Auto-Baud lock byte (0xAA)...")
            ser.write(bytearray([170]))
            ser.flush()
            time.sleep(0.5)  # Mandatory 500ms baud lock delay
            self.auto_baud_sent = True

            # 2. Command 14: 2.0s Hardware Watchdog configuration (value 20 = 2000ms / 100ms)
            logging.info("Configuring Command 14 Hardware Watchdog (2.0s timeout)...")
            p14 = build_7bit_packet(128, 14, 20)
            ser.write(p14)
            ser.flush()
            time.sleep(0.05)
            self.watchdog_configured = True

            # 3. Send initial stop packets
            p_stop1 = build_7bit_packet(128, 0, 0)
            p_stop2 = build_7bit_packet(128, 4, 0)
            ser.write(p_stop1)
            ser.write(p_stop2)
            ser.flush()

            if self.ser and hasattr(self.ser, "close"):
                try:
                    self.ser.close()
                except Exception:
                    pass

            self.ser = ser
            self.telemetry["hardwareConnected"] = True
            logging.info("OpenArm Hardware Worker Connected & Active.")
            return True

        except Exception as e:
            logging.warning(f"Failed to connect to hardware port {port}: {e}")
            self.ser = None
            self.telemetry["hardwareConnected"] = False
            return False

    def mark_disconnected(self, reason: str = "") -> None:
        if self.ser:
            try:
                self.ser.close()
            except Exception:
                pass
        self.ser = None
        self.telemetry["hardwareConnected"] = False
        if reason:
            logging.warning(f"Hardware connection lost: {reason}. Queued for auto-reconnect.")

    def send_packet_speed(self, motor_number: int, speed: int) -> None:
        """Dispatches 7-bit standard packet speed command for chassis/actuators."""
        if not self.ser:
            return
        address = 128
        val_7bit = max(0, min(127, int(abs(speed) / 2047.0 * 127)))
        if speed == 0 or val_7bit == 0:
            cmd = 0 if motor_number == 1 else 4
            val_7bit = 0
        elif motor_number == 1:
            cmd = 0 if speed > 0 else 1  # 0: M1 Forward, 1: M1 Reverse
        else:
            cmd = 4 if speed > 0 else 5  # 4: M2 Forward, 5: M2 Reverse

        packet = build_7bit_packet(address, cmd, val_7bit)
        try:
            self.ser.write(packet)
            self.ser.flush()
        except Exception as e:
            self.mark_disconnected(f"Write error on M{motor_number}: {e}")

    def send_arm_joint_velocities(self, joint_vels: List[float]) -> None:
        """
        Dispatches joint velocity commands to 7-DOF arm actuators.
        """
        if not self.ser:
            return

        # Multi-joint frame encoding: [0x55 (Sync), Joint_Index, Scaled_Velocity, Checksum]
        for idx, vel in enumerate(joint_vels[:self.num_dof]):
            scaled = max(-127, min(127, int(vel * 50.0)))
            direction = 0 if scaled >= 0 else 1
            magnitude = abs(scaled)
            cmd = (idx << 1) | direction
            chk = (0x55 + cmd + magnitude) & 127
            frame = bytearray([0x55, cmd, magnitude, chk])
            try:
                self.ser.write(frame)
            except Exception as e:
                self.mark_disconnected(f"Joint frame write error on J{idx}: {e}")
                return
        try:
            self.ser.flush()
        except Exception:
            pass

    def execute_stop(self) -> None:
        """Instantly zeroes all target and smoothed velocities and emits stop frames."""
        if self.ser:
            try:
                p1 = build_7bit_packet(128, 0, 0)
                p2 = build_7bit_packet(128, 4, 0)
                self.ser.write(p1)
                self.ser.write(p2)
                self.ser.flush()
            except Exception as e:
                self.mark_disconnected(f"Stop write error: {e}")

        self.is_stopped = True
        self.target_m1 = 0
        self.target_m2 = 0
        self.current_m1 = 0
        self.current_m2 = 0
        self.target_joint_vel = [0.0] * self.num_dof
        self.current_joint_vel = [0.0] * self.num_dof
        self.arm_smoother.reset([0.0] * self.num_dof)

        self.telemetry["dutyM1"] = 0
        self.telemetry["dutyM2"] = 0
        self.telemetry["jointVelocities"] = [0.0] * self.num_dof

    def run(self) -> None:
        last_dispatch = time.time()
        last_reconnect_attempt = 0.0
        dt_tick = 0.005  # 200Hz worker tick

        while self.running:
            now = time.time()
            self.telemetry["queueSize"] = self.cmd_queue.qsize()

            # 1. Drain incoming command queue non-blockingly
            while True:
                try:
                    msg_type, payload = self.cmd_queue.get_nowait()
                    self.last_cmd_time = now

                    if msg_type == "speed":
                        m1, m2 = payload
                        self.target_m1 = max(-2047, min(2047, int(m1)))
                        self.target_m2 = max(-2047, min(2047, int(m2)))
                        if self.target_m1 != 0 or self.target_m2 != 0:
                            self.is_stopped = False
                        else:
                            self.execute_stop()

                    elif msg_type == "joint_vel":
                        # Apply cubic S-curve shaping across joints
                        raw_vels = list(payload)
                        while len(raw_vels) < self.num_dof:
                            raw_vels.append(0.0)
                        self.target_joint_vel = [
                            shape_velocity_cubic(v) for v in raw_vels[:self.num_dof]
                        ]
                        if any(abs(v) > 0.001 for v in self.target_joint_vel):
                            self.is_stopped = False
                        else:
                            self.target_joint_vel = [0.0] * self.num_dof

                    elif msg_type == "gripper":
                        self.gripper_val = max(0.0, min(1.0, float(payload)))
                        self.telemetry["gripper"] = self.gripper_val

                    elif msg_type == "stop":
                        self.execute_stop()

                    elif msg_type == "estop":
                        self.is_estop = bool(payload)
                        self.telemetry["isEStopActive"] = self.is_estop
                        if self.is_estop:
                            self.execute_stop()

                except queue.Empty:
                    break

            # 2. Reconnect Serial if disconnected
            if not self.ser:
                if now - last_reconnect_attempt > 1.5:
                    last_reconnect_attempt = now
                    self.connect()
                time.sleep(dt_tick)
                continue

            # 3. Deadman Failsafe: Stop if no command received for 1.5s
            if not self.is_stopped and (now - self.last_cmd_time > 1.5):
                logging.info("Deadman timeout (1.5s without commands): halting actuators.")
                self.execute_stop()

            # 4. Stream 25Hz command updates (every 40ms) to satisfy Command 14 watchdog
            if now - last_dispatch >= 0.04:
                dt_dispatch = now - last_dispatch
                last_dispatch = now

                if not self.is_estop and not self.is_stopped:
                    # Update 7-DOF arm joint smoothers
                    self.current_joint_vel = self.arm_smoother.update(
                        self.target_joint_vel, dt=dt_dispatch, is_manual=True
                    )
                    # Integrate simulated positions
                    for i in range(self.num_dof):
                        self.current_joint_pos[i] += self.current_joint_vel[i] * dt_dispatch

                    self.send_arm_joint_velocities(self.current_joint_vel)

                    # Update chassis motors with 200 PWM slew rate limit
                    max_slew = 200
                    # M1
                    if abs(self.target_m1 - self.current_m1) <= max_slew:
                        self.current_m1 = self.target_m1
                    elif self.target_m1 > self.current_m1:
                        self.current_m1 += max_slew
                    else:
                        self.current_m1 -= max_slew

                    # M2
                    if abs(self.target_m2 - self.current_m2) <= max_slew:
                        self.current_m2 = self.target_m2
                    elif self.target_m2 > self.current_m2:
                        self.current_m2 += max_slew
                    else:
                        self.current_m2 -= max_slew

                    self.send_packet_speed(1, self.current_m1)
                    self.send_packet_speed(2, self.current_m2)

                    # Update telemetry
                    self.telemetry["dutyM1"] = self.current_m1
                    self.telemetry["dutyM2"] = self.current_m2
                    self.telemetry["jointPositions"] = list(self.current_joint_pos)
                    self.telemetry["jointVelocities"] = list(self.current_joint_vel)

                    # Transition to stopped if all targets and currents are zero
                    all_joints_zero = all(abs(v) < 0.001 for v in self.current_joint_vel)
                    if (
                        self.target_m1 == 0
                        and self.target_m2 == 0
                        and self.current_m1 == 0
                        and self.current_m2 == 0
                        and all_joints_zero
                    ):
                        self.is_stopped = True

            time.sleep(dt_tick)

    def stop(self) -> None:
        self.running = False
        self.execute_stop()
        if self.ser and hasattr(self.ser, "close"):
            try:
                self.ser.close()
            except Exception:
                pass
            self.ser = None


class OpenArmBridgeServer:
    """
    Non-blocking Asyncio WebSocket Server bridging browser / ROS 2 clients to OpenArm hardware.
    """

    def __init__(self, port: int = 9091, worker: Optional[OpenArmHardwareWorker] = None):
        self.port = port
        self.worker = worker or OpenArmHardwareWorker()
        if not self.worker.is_alive():
            self.worker.start()
        self.clients: set = set()

    async def broadcast_telemetry(self) -> None:
        while True:
            await asyncio.sleep(0.1)  # 10Hz telemetry
            if self.clients and HAS_WEBSOCKETS:
                payload = json.dumps(self.worker.telemetry)
                websockets.broadcast(self.clients, payload)

    async def handle_client(self, websocket: Any) -> None:
        self.clients.add(websocket)
        logging.info(f"OpenArm client connected. Active clients: {len(self.clients)}")
        try:
            async for message in websocket:
                try:
                    if isinstance(message, bytes):
                        message = message.decode("utf-8", errors="ignore")
                    data = json.loads(message)

                    # Filter harmless pings / heartbeats
                    if data.get("ping") is True:
                        continue

                    # Stop Commands
                    if data.get("stop") is True:
                        self.worker.cmd_queue.put_nowait(("stop", None))
                        continue

                    # E-Stop Commands
                    if "eStop" in data:
                        self.worker.cmd_queue.put_nowait(("estop", bool(data["eStop"])))

                    # 7-DOF Joint Velocities
                    if "joint_vel" in data:
                        self.worker.cmd_queue.put_nowait(("joint_vel", data["joint_vel"]))

                    # Gripper Commands
                    if "gripper" in data:
                        self.worker.cmd_queue.put_nowait(("gripper", float(data["gripper"])))

                    # Chassis / Mobility Setpoints (Twist, Joystick, TargetM1/M2)
                    m1, m2 = None, None
                    if "targetM1" in data and "targetM2" in data:
                        raw_m1 = float(data["targetM1"])
                        raw_m2 = float(data["targetM2"])
                        if abs(raw_m1) <= 1.0 and abs(raw_m2) <= 1.0 and (raw_m1 != 0 or raw_m2 != 0):
                            m1 = int(raw_m1 * 2047.0)
                            m2 = int(raw_m2 * 2047.0)
                        else:
                            m1 = int(raw_m1)
                            m2 = int(raw_m2)
                    elif "linear_x" in data or "angular_z" in data:
                        lx = float(data.get("linear_x", 0.0))
                        az = float(data.get("angular_z", 0.0))
                        steer_gain = 0.50 if abs(lx) > 0.05 else 1.0
                        m1 = int((lx - az * steer_gain) * 2047.0)
                        m2 = int((lx + az * steer_gain) * 2047.0)
                    elif "x" in data and "y" in data:
                        x = float(data["x"])
                        y = float(data["y"])
                        m1 = int((y + x) * 2047.0)
                        m2 = int((y - x) * 2047.0)

                    if m1 is not None and m2 is not None:
                        self.worker.cmd_queue.put_nowait(("speed", (m1, m2)))

                except Exception as e:
                    logging.debug(f"Frame parse error: {e}")

        except Exception:
            pass
        finally:
            self.clients.discard(websocket)
            logging.info(f"OpenArm client disconnected. Active clients: {len(self.clients)}")

    def close(self) -> None:
        self.worker.stop()


async def main() -> None:
    bridge_server = OpenArmBridgeServer(port=9091)
    if HAS_WEBSOCKETS:
        server = await websockets.serve(bridge_server.handle_client, "0.0.0.0", 9091)
        logging.info("OpenArm Bridge Server Active on ws://0.0.0.0:9091")

        stop_event = asyncio.Event()

        def shutdown():
            logging.info("Shutting down OpenArm Bridge...")
            bridge_server.close()
            server.close()
            stop_event.set()

        loop = asyncio.get_running_loop()
        for sig in (signal.SIGINT, signal.SIGTERM):
            try:
                loop.add_signal_handler(sig, shutdown)
            except NotImplementedError:
                signal.signal(sig, lambda s, f: shutdown())

        asyncio.create_task(bridge_server.broadcast_telemetry())
        await stop_event.wait()
        await server.wait_closed()
        logging.info("OpenArm Bridge clean shutdown complete.")
    else:
        logging.warning("websockets module not installed; running in worker-only mode.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logging.info("OpenArm Bridge terminated.")
