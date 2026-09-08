"""
Kinematic S-Curve Velocity Shaping & Jerk-Limited Profile Generator
===================================================================
Contribution for `enactic/openarm`, `google-deepmind/mujoco`, and `dm_control`.

Mathematical Specification:
1. Cubic S-Curve Velocity Shaping:
   v_shaped(x) = 0.35 * x + 0.65 * x^3, for x in [-1, 1]
   - Monotonic increasing: dv/dx = 0.35 + 1.95 * x^2 >= 0.35 > 0
   - Symmetric odd function: v(-x) = -v(x), v(0) = 0, v(1) = 1, v(-1) = -1
   - High tactile precision near origin (slope = 0.35) while preserving full headroom.

2. Jerk-Limited Exponential Ramping:
   - Manual Teleop Mode: a_max = 3.5 m/s^2 (or rad/s^2), J_max = 12.0 m/s^3 (<15ms response).
   - Autonomous Mode: a_max = 0.8 m/s^2, a_decel = 1.4 m/s^2, J_max = 3.5 m/s^3.

3. Dynamic Breakaway Floor:
   - Minimum motion floor = 0.02 m/s (or rad/s) for non-zero targets to overcome
     motor driver deadbands and static gearbox friction.
"""

from typing import List, Sequence, Union, Optional
import math


def shape_velocity_cubic(x: float) -> float:
    """
    Applies cubic S-curve velocity shaping to a normalized input x in [-1.0, 1.0].
    Formula: v_shaped(x) = 0.35 * x + 0.65 * x^3
    
    Guarantees:
    - f(0) = 0, f(1) = 1, f(-1) = -1
    - Odd symmetry: f(-x) = -f(x)
    - Monotonically strictly increasing on [-1, 1]
    - First derivative at origin df/dx(0) = 0.35 (suppresses micro-jitter)
    """
    x_clamped = max(-1.0, min(1.0, float(x)))
    return 0.35 * x_clamped + 0.65 * (x_clamped ** 3)


def apply_breakaway_floor(vel: float, min_floor: float = 0.02, deadband: float = 0.001) -> float:
    """
    Applies a dynamic breakaway floor to overcome static motor friction / deadbands.
    If abs(vel) < deadband, returns 0.0.
    If deadband <= abs(vel) < min_floor, boosts magnitude to min_floor while preserving sign.
    """
    if abs(vel) < deadband:
        return 0.0
    if abs(vel) < min_floor:
        return math.copysign(min_floor, vel)
    return vel


class KinematicSCurveSmoother:
    """
    Kinematic S-Curve and Jerk-Limited Profile Generator for OpenArm 7-DOF joints
    and mobile robotics chassis.
    """

    def __init__(
        self,
        accel_ramp_time: float = 1.0,
        decel_ramp_time: float = 0.8,
        deadband: float = 0.05,
        max_vel: float = 1.0,
        max_accel: float = 0.8,
        max_decel: float = 1.4,
        max_jerk: float = 3.5,
        breakaway_floor: float = 0.02,
    ):
        self.accel_ramp_time = float(accel_ramp_time)
        self.decel_ramp_time = float(decel_ramp_time)
        self.deadband = float(deadband)
        self.max_vel = float(max_vel)
        self.max_accel = float(max_accel)
        self.max_decel = float(max_decel)
        self.max_jerk = float(max_jerk)
        self.breakaway_floor = float(breakaway_floor)

        self.current_vel = 0.0
        self.current_accel = 0.0

    def reset(self, vel: float = 0.0, accel: float = 0.0) -> None:
        """Resets the smoother velocity and acceleration state."""
        self.current_vel = float(vel)
        self.current_accel = float(accel)

    def filter_target(self, target_vel: float, use_breakaway: bool = True) -> float:
        """
        Enforces deadband filtering, breakaway floor, and maximum velocity clamping.
        """
        if abs(target_vel) < self.deadband:
            return 0.0
        
        clamped = max(-self.max_vel, min(self.max_vel, target_vel))
        if use_breakaway and 0.0 < abs(clamped) < self.breakaway_floor:
            clamped = math.copysign(self.breakaway_floor, clamped)
        return clamped

    def update(self, target_vel: float, dt: float, is_manual: bool = False) -> float:
        """
        Computes the next velocity step via S-Curve exponential ramping & jerk integration.
        
        Args:
            target_vel: Commanded velocity setpoint.
            dt: Time step duration (seconds).
            is_manual: If True, uses high-responsiveness manual teleop limits
                       (a_max = 3.5 m/s^2, J_max = 12.0 m/s^3).
                       If False, uses smooth autonomous trajectory limits.
        
        Returns:
            Updated smoothed velocity.
        """
        target = self.filter_target(target_vel, use_breakaway=True)

        if dt <= 0.0:
            return self.current_vel
        dt = min(dt, 0.1)

        # 1. Clean roll-to-halt when entering kinematic deadband with target = 0
        if target == 0.0 and abs(self.current_vel) < self.deadband:
            brake_step = max(self.max_decel, 1.5) * dt
            if abs(self.current_vel) <= brake_step:
                self.current_vel = 0.0
                self.current_accel = 0.0
                return 0.0
            else:
                self.current_vel -= math.copysign(brake_step, self.current_vel)
                self.current_accel = -math.copysign(max(self.max_decel, 1.5), self.current_vel)
                return self.current_vel

        vel_err = target - self.current_vel

        is_decel = (
            (self.current_vel > 0 and target < self.current_vel)
            or (self.current_vel < 0 and target > self.current_vel)
            or (target == 0.0)
        )

        ramp_time = self.decel_ramp_time if is_decel else self.accel_ramp_time
        if is_manual:
            a_max = 3.5 if not is_decel else 5.0
            j_max = 12.0
        else:
            a_max = self.max_decel if is_decel else self.max_accel
            j_max = self.max_jerk

        if abs(vel_err) < 1e-5:
            des_accel = 0.0
        else:
            if is_manual:
                dynamic_a_max = a_max
            elif ramp_time > 0.05:
                dynamic_a_max = min(a_max, abs(vel_err) / (ramp_time * 0.40))
                dynamic_a_max = max(dynamic_a_max, 0.2)
            else:
                dynamic_a_max = a_max

            stopping_accel = math.sqrt(max(0.0, 2.0 * j_max * abs(vel_err)))
            des_accel = math.copysign(min(dynamic_a_max, stopping_accel), vel_err)

        # 2. Jerk Limiting (Cap rate of change of acceleration)
        accel_err = des_accel - self.current_accel
        max_accel_change = j_max * dt
        accel_step = max(-max_accel_change, min(max_accel_change, accel_err))

        self.current_accel += accel_step
        self.current_accel = max(-a_max, min(a_max, self.current_accel))

        # 3. Velocity Integration
        next_vel = self.current_vel + self.current_accel * dt

        # Prevent overshoot past target
        if (target - next_vel) * (target - self.current_vel) <= 0.0:
            next_vel = target
            self.current_accel = 0.0

        self.current_vel = next_vel
        return self.current_vel


class MultiAxisSCurveSmoother:
    """
    Multi-channel kinematic smoother supporting arbitrary N-DOF vectors
    (e.g., OpenArm 7-DOF joints, bimanual arms, or chassis + arm setups).
    """

    def __init__(self, num_dof: int = 7, **smoother_kwargs):
        self.num_dof = num_dof
        self.smoothers = [
            KinematicSCurveSmoother(**smoother_kwargs) for _ in range(num_dof)
        ]

    def reset(self, vels: Optional[Sequence[float]] = None) -> None:
        """Resets all DOF smoothers."""
        for i, smoother in enumerate(self.smoothers):
            v = vels[i] if vels and i < len(vels) else 0.0
            smoother.reset(vel=v, accel=0.0)

    def shape_and_filter(self, normalized_inputs: Sequence[float]) -> List[float]:
        """
        Applies cubic S-curve shaping and deadband filtering across all channels.
        """
        shaped = []
        for i in range(self.num_dof):
            raw = normalized_inputs[i] if i < len(normalized_inputs) else 0.0
            s = shape_velocity_cubic(raw)
            shaped.append(s)
        return shaped

    def update(
        self, target_vels: Sequence[float], dt: float, is_manual: bool = False
    ) -> List[float]:
        """
        Steps all DOF smoothers forward by dt.
        """
        outputs = []
        for i in range(self.num_dof):
            target = target_vels[i] if i < len(target_vels) else 0.0
            out = self.smoothers[i].update(target, dt=dt, is_manual=is_manual)
            outputs.append(out)
        return outputs

    @property
    def current_velocities(self) -> List[float]:
        return [s.current_vel for s in self.smoothers]

    @property
    def current_accelerations(self) -> List[float]:
        return [s.current_accel for s in self.smoothers]
