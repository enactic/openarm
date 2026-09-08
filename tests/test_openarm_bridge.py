"""
Unit and Integration Tests for OpenArm Hardware Bridge & Kinematic S-Curve
==========================================================================
Verifies:
1. Lock-free queue throughput and non-blocking worker performance.
2. Asyncio event loop isolation (zero blocking I/O).
3. S-Curve mathematical invariants (monotonicity, derivative at origin, odd symmetry).
4. Dynamic breakaway floor and deadband filtering.
5. Jerk-limited kinematic smoother integration.
6. 7-bit checksum validation: (Address + Command + Value) & 127.
7. Single-shot auto-baud locking (0xAA) and Command 14 (2.0s) watchdog.
8. Deadman timeout failsafe auto-stop.
9. Serial port auto-hunting and UART device filtering.
"""

import asyncio
import json
import math
import queue
import time
import pytest
from typing import List

import os
import sys

# Resilient path resolution for both local Gemma OS and upstream enactic/openarm
openarm_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if openarm_dir not in sys.path:
    sys.path.insert(0, openarm_dir)
openarm_hw_dir = os.path.join(openarm_dir, "openarm_hardware")
if openarm_hw_dir not in sys.path:
    sys.path.insert(0, openarm_hw_dir)

try:
    from openarm_hardware.kinematic_scurve import (
        shape_velocity_cubic,
        apply_breakaway_floor,
        KinematicSCurveSmoother,
        MultiAxisSCurveSmoother,
    )
    from openarm_hardware.openarm_hardware_bridge import (
        OpenArmHardwareWorker,
        OpenArmBridgeServer,
        MockSerialPort,
        calculate_7bit_checksum,
        build_7bit_packet,
        filter_uart_ports,
    )
except ImportError:
    try:
        from kinematic_scurve import (
            shape_velocity_cubic,
            apply_breakaway_floor,
            KinematicSCurveSmoother,
            MultiAxisSCurveSmoother,
        )
        from openarm_hardware_bridge import (
            OpenArmHardwareWorker,
            OpenArmBridgeServer,
            MockSerialPort,
            calculate_7bit_checksum,
            build_7bit_packet,
            filter_uart_ports,
        )
    except ImportError:
        from contributions.openarm.kinematic_scurve import (
            shape_velocity_cubic,
            apply_breakaway_floor,
            KinematicSCurveSmoother,
            MultiAxisSCurveSmoother,
        )
        from contributions.openarm.openarm_hardware_bridge import (
            OpenArmHardwareWorker,
            OpenArmBridgeServer,
            MockSerialPort,
            calculate_7bit_checksum,
            build_7bit_packet,
            filter_uart_ports,
        )


class TestSCurveMathematics:
    """Test suite for analytical properties of the cubic S-curve and kinematic ramping."""

    def test_scurve_boundary_values(self):
        assert math.isclose(shape_velocity_cubic(0.0), 0.0, abs_tol=1e-7)
        assert math.isclose(shape_velocity_cubic(1.0), 1.0, abs_tol=1e-7)
        assert math.isclose(shape_velocity_cubic(-1.0), -1.0, abs_tol=1e-7)

    def test_scurve_odd_symmetry(self):
        test_points = [-0.9, -0.75, -0.5, -0.25, -0.1, 0.0, 0.1, 0.25, 0.5, 0.75, 0.9]
        for x in test_points:
            f_x = shape_velocity_cubic(x)
            f_neg_x = shape_velocity_cubic(-x)
            assert math.isclose(f_x, -f_neg_x, abs_tol=1e-7), f"Failed symmetry at x={x}"

    def test_scurve_monotonic_increasing(self):
        samples = [i / 1000.0 for i in range(-1000, 1001)]
        prev = shape_velocity_cubic(samples[0])
        for x in samples[1:]:
            curr = shape_velocity_cubic(x)
            assert curr > prev, f"Monotonicity violated between {x-0.001} and {x}"
            prev = curr

    def test_scurve_derivative_at_origin(self):
        # f(x) = 0.35x + 0.65x^3 => f'(0) = 0.35
        eps = 1e-5
        numerical_derivative = (shape_velocity_cubic(eps) - shape_velocity_cubic(-eps)) / (2 * eps)
        assert math.isclose(numerical_derivative, 0.35, rel_tol=1e-4)

    def test_scurve_clamping(self):
        assert shape_velocity_cubic(2.5) == 1.0
        assert shape_velocity_cubic(-3.0) == -1.0

    def test_dynamic_breakaway_floor(self):
        # Deadband cutoff
        assert apply_breakaway_floor(0.0005, min_floor=0.02, deadband=0.001) == 0.0
        assert apply_breakaway_floor(-0.0005, min_floor=0.02, deadband=0.001) == 0.0

        # Sub-floor boost
        assert math.isclose(apply_breakaway_floor(0.01, min_floor=0.02), 0.02)
        assert math.isclose(apply_breakaway_floor(-0.01, min_floor=0.02), -0.02)

        # Normal above-floor preservation
        assert math.isclose(apply_breakaway_floor(0.15, min_floor=0.02), 0.15)
        assert math.isclose(apply_breakaway_floor(-0.45, min_floor=0.02), -0.45)


class TestKinematicSmoother:
    """Test suite for single-axis and multi-axis kinematic smoothers."""

    def test_smoother_acceleration_and_jerk_limits(self):
        smoother = KinematicSCurveSmoother(
            max_vel=1.0, max_accel=3.5, max_jerk=12.0, deadband=0.01, breakaway_floor=0.02
        )
        target = 1.0
        dt = 0.02  # 50Hz
        prev_accel = 0.0

        for step in range(60):
            v = smoother.update(target, dt=dt, is_manual=True)
            jerk = abs(smoother.current_accel - prev_accel) / dt
            # Allow small float numerical leeway
            assert jerk <= 12.0 + 1e-3, f"Jerk limit exceeded at step {step}: jerk={jerk}"
            assert abs(smoother.current_accel) <= 3.5 + 1e-3
            prev_accel = smoother.current_accel
            if math.isclose(v, target, abs_tol=1e-3):
                break

        assert math.isclose(smoother.current_vel, 1.0, abs_tol=1e-2)

    def test_smoother_roll_to_halt(self):
        smoother = KinematicSCurveSmoother(
            max_vel=1.0, max_accel=2.0, max_decel=2.5, deadband=0.05
        )
        # Spin up (50 steps at dt=0.02 = 1.0s)
        for _ in range(50):
            smoother.update(0.8, dt=0.02)
        assert smoother.current_vel > 0.5

        # Command stop (0.0)
        for _ in range(100):
            v = smoother.update(0.0, dt=0.02)
            if v == 0.0:
                break

        assert smoother.current_vel == 0.0
        assert smoother.current_accel == 0.0

    def test_multi_axis_7dof_smoother(self):
        multi = MultiAxisSCurveSmoother(num_dof=7, max_vel=2.0, max_accel=3.5, max_jerk=12.0)
        assert len(multi.current_velocities) == 7
        assert all(v == 0.0 for v in multi.current_velocities)

        target_joints = [0.5, -0.4, 0.8, -0.2, 0.1, -0.9, 0.3]
        for _ in range(60):
            multi.update(target_joints, dt=0.02, is_manual=True)

        for i, target in enumerate(target_joints):
            assert math.isclose(multi.current_velocities[i], target, abs_tol=0.05)


class Test7BitChecksumAndPackets:
    """Test suite for standard 7-bit checksum and packet serial protocol."""

    def test_checksum_calculation(self):
        # Address 128, Command 0, Value 0 => Checksum (128+0+0) & 127 = 0
        assert calculate_7bit_checksum(128, 0, 0) == 0

        # Command 14 Watchdog (20): (128 + 14 + 20) & 127 = 162 & 127 = 34
        assert calculate_7bit_checksum(128, 14, 20) == 34

        # Command 4 Motor 2 Stop: (128 + 4 + 0) & 127 = 132 & 127 = 4
        assert calculate_7bit_checksum(128, 4, 0) == 4

    def test_packet_assembly(self):
        p_watchdog = build_7bit_packet(128, 14, 20)
        assert list(p_watchdog) == [128, 14, 20, 34]

        p_stop1 = build_7bit_packet(128, 0, 0)
        assert list(p_stop1) == [128, 0, 0, 0]

        p_stop2 = build_7bit_packet(128, 4, 0)
        assert list(p_stop2) == [128, 4, 0, 4]


class TestPortHuntingAndFiltering:
    """Test suite for UART peripheral filtering (excluding RPLiDAR CP2102)."""

    def test_filter_uart_ports_excludes_blacklist(self):
        mock_candidates = [
            "/dev/ttyUSB0_cp2102",
            "/dev/serial/by-id/usb-Silicon_Labs_CP2102_USB_to_UART_Bridge-if00-port0",
            "/dev/serial/by-id/usb-rplidar_A1_0001",
            "/dev/ttyACM0",
            "/dev/serial/by-id/usb-Dimension_Engineering_Sabertooth_2x32-if00",
            "/dev/ttyUSB1_openarm",
        ]
        filtered = filter_uart_ports(port_list=mock_candidates)
        assert "/dev/ttyACM0" in filtered
        assert "/dev/serial/by-id/usb-Dimension_Engineering_Sabertooth_2x32-if00" in filtered
        assert "/dev/ttyUSB1_openarm" in filtered

        # Check blacklist exclusions
        assert not any("cp2102" in p.lower() for p in filtered)
        assert not any("rplidar" in p.lower() for p in filtered)


class TestLockFreeWorkerAndThreadIsolation:
    """Test suite for thread-isolated lock-free worker architecture."""

    def test_lock_free_queue_throughput(self):
        worker = OpenArmHardwareWorker(port="MOCK_TEST_PORT", use_mock_if_missing=True)
        worker.ser = MockSerialPort()
        worker.running = True

        # Push 150 items into queue rapidly without locking
        start_t = time.perf_counter()
        for i in range(150):
            worker.cmd_queue.put_nowait(("speed", (i * 10, -i * 10)))
        push_duration = time.perf_counter() - start_t

        assert worker.cmd_queue.qsize() == 150
        assert push_duration < 0.05  # Ultra fast non-blocking insertion (<50ms for 150 items)
        worker.stop()

    def test_auto_baud_and_watchdog_initialization(self):
        worker = OpenArmHardwareWorker(port="MOCK_INIT", use_mock_if_missing=True)
        worker.connect()
        assert worker.auto_baud_sent is True
        assert worker.watchdog_configured is True
        assert worker.telemetry["hardwareConnected"] is True
        worker.stop()

    def test_deadman_watchdog_failsafe(self):
        worker = OpenArmHardwareWorker(port="MOCK_DEADMAN", use_mock_if_missing=True)
        worker.connect()
        worker.start()

        # Command active motion
        worker.cmd_queue.put_nowait(("speed", (1000, 1000)))
        time.sleep(0.1)
        assert worker.is_stopped is False

        # Simulate 1.6s of silence (exceeds 1.5s deadman threshold)
        worker.last_cmd_time = time.time() - 1.6
        time.sleep(0.08)

        # Worker should have triggered deadman failsafe and executed stop
        assert worker.is_stopped is True
        assert worker.target_m1 == 0
        assert worker.target_m2 == 0

        worker.stop()

    def test_estop_immediate_halt(self):
        worker = OpenArmHardwareWorker(port="MOCK_ESTOP", use_mock_if_missing=True)
        worker.connect()
        worker.start()

        worker.cmd_queue.put_nowait(("speed", (1500, 1500)))
        time.sleep(0.06)

        # Trigger E-Stop
        worker.cmd_queue.put_nowait(("estop", True))
        time.sleep(0.06)

        assert worker.is_estop is True
        assert worker.is_stopped is True
        assert worker.telemetry["isEStopActive"] is True

        worker.stop()


@pytest.mark.asyncio
async def test_async_event_loop_non_blocking_performance():
    """Verifies that WebSocket client handling and queue dispatches never stall the async event loop."""
    worker = OpenArmHardwareWorker(port="MOCK_ASYNC", use_mock_if_missing=True)
    worker.connect()
    worker.start()
    bridge_server = OpenArmBridgeServer(port=9099, worker=worker)

    try:
        class MockWebSocket:
            def __init__(self, messages):
                self.messages = messages

            def __aiter__(self):
                return self

            async def __anext__(self):
                if not self.messages:
                    raise StopAsyncIteration
                await asyncio.sleep(0)  # Cooperative event loop yield (avoids Windows 15.6ms OS timer quantization)
                return self.messages.pop(0)

        # Queue up 50 high-frequency messages
        messages = [
            json.dumps({"targetM1": 0.5, "targetM2": -0.5}),
            json.dumps({"joint_vel": [0.1, -0.2, 0.3, 0.4, -0.5, 0.6, -0.7]}),
            json.dumps({"gripper": 0.85}),
            json.dumps({"ping": True}),
            json.dumps({"stop": True}),
        ] * 10

        mock_ws = MockWebSocket(messages)
        t0 = time.perf_counter()
        await bridge_server.handle_client(mock_ws)
        total_elapsed = time.perf_counter() - t0

        # 50 messages handled asynchronously in under 500ms total
        assert total_elapsed < 0.50
    finally:
        bridge_server.close()
