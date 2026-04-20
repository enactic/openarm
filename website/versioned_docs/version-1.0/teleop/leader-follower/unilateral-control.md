---
sidebar_position: 2
---
# Unilateral Control

This section describes how to run unilateral control using the provided scripts

## 💡 Project Architecture Summary

The project uses a **multi-threaded structure**.

A custom class derived from `PeriodicTimerThread` is used to spawn and manage **three threads**:

- **Leader thread**: Handles control logic for the leader arm.
- **Follower thread**: Handles control logic for the follower arm.
- **Admin thread**: Manages coordination and communication between components.

Core control logic is encapsulated in the `Control` class, which supports both:

- **Bilateral control**: For force-feedback, master-slave style interaction.
- **Unilateral control**: For single-arm or open-loop operation without feedback.

## Control & Friction Parameters (per joint)

| Name | Meaning |
|------|---------|
| **Kp** | Position control gain |
| **Kd** | Velocity control gain |
| **Fc** | Static friction (Coulomb) level |
| **k**  | Sharpness of friction transition |
| **Fv** | Viscous friction (speed-based) |
| **Fo** | Friction offset (bias correction) |


### Friction compasation Model

The following tanh-based model is used for friction compensation:

```text
tau_f = Fc * tanh(k * dq) + Fv * dq + Fo
```

## Running the Script

right_arm (default can bus is can0 can2)
```bash
cd openarm_teleop
./script/launch_unilateral.sh right_arm can0 can2
```

left_arm (default can bus is can1 can3)
```bash
cd openarm_teleop
./script/launch_unilateral.sh left_arm can1 can3
```

### Arguments

- `right_arm` or `left_arm`: Specifies which arm to use.
- `can0, can1`: CAN interface for the leader arm.
- `can2, can3`: CAN interface for the follower arm.

If the CAN interfaces are omitted, the script uses the following defaults:

- For `right_arm`: leader = `can0`, follower = `can2`
- For `left_arm`: leader = `can1`, follower = `can3`

### What the Script Does

1. Validates the arm side (`right_arm` or `left_arm`).
2. Sets default CAN interfaces if not specified.
3. Generates temporary URDFs for the leader and follower using xacro.
4. Launches the unilateral control binary with appropriate arguments.
5. Cleans up temporary files after execution.

### File Paths Used

- Xacro file: `~/openarm_ros2_ws/src/openarm_description/urdf/robot/v10.urdf.xacro`
- Generated URDFs: `/tmp/openarm_urdf_gen/{v10_leader.urdf, v10_follower.urdf}`
- Binary: `~/openarm_teleop/build/unilateral_control`

:::warning[Important Notes for Unilateral Control]
- The **zero position** of the arm is defined as the posture where the arm is **lowered straight down**.
  Make sure the robot is in this position before starting control.
  - When performing the zero position calibration, please run it for the leader arm and the follower arm separately, while they are in their independent states.
- Unlike bilateral control, **unilateral control does not provide force feedback**.
  Be cautious when making contact with objects, as unexpected forces will not be reflected to the operator.
:::
