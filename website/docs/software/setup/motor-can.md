---
title: Motor CAN Communication
sidebar_position: 3
---

## Damiao Motor CAN Communication

:::note Firmware Version Dependency
This documentation is based on Damiao motor firmware versions ending with "15". Different firmware versions may have different protocol implementations. Please ensure your motor firmware is compatible with the protocol described here.
:::

### Protocol Overview

The Damiao motor control protocol is a request-response protocol over CAN that follows a simple one-send-one-response pattern. The protocol supports three main types of interactions:

- **Control Commands**: Motor responds with state information (position, velocity, torque, mos temperature, rotor temperature)
  - **High-Level Control Commands** handle motor state management:
    - **Enable/Disable**: Control motor power state
    - **Set Zero**: Set current position as zero reference
  - **Motor Movement Control Commands** provide four different control modes for actual motor movement:
    - **MIT Mode** *Default mode used in OpenArm*
    - **Position Mode**
    - **Velocity Mode**
    - **Position-Torque Mode**
- **Parameter R/W**: Motor responds with parameter values read from register
- **Refresh Frames**: Used to query motor state when no control command is needed

Control modes can be configured through the debugger or using write commands (not covered in this tutorial). Our OpenArm implementation is based on MIT mode.

:::info Detailed Documentation
For comprehensive protocol details, refer to the [DM-J4310-2EC motor documentation](https://gitee.com/kit-miao/DM-J4310-2EC/blob/master/%E8%AF%B4%E6%98%8E%E4%B9%A6/DM-J4310-2EC%20V1.1%E5%87%8F%E9%80%9F%E7%94%B5%E6%9C%BA%E8%AF%B4%E6%98%8E%E4%B9%A6V1.0.pdf) as an example reference. OpenArm provides convenient wrappers for motor control in the [openarm_can](https://github.com/enactic/openarm_can) package.
:::


#### MIT Mode Information
MIT mode enables hybrid control of torque, position, and velocity for a motor. In this mode, the position and velocity loops are connected in parallel, and their output values are summed with the feedforward torque ($t_{ff}$) to determine the reference torque ($T_{ref}$). The equation for the reference torque is given by:

$$T_{ref}=kp^{}(p_{des}-\theta_{m})+kd^{}(v_{des}-d\theta_{m})+t_{ff}$$

Where:
- $T_{ref}$ is the reference torque in N·m
- $kp$ is the position gain
- $kd$ is the velocity gain
- $p_{des}$ is the desired position of the motor output shaft in rad
- $\theta_{m}$ is the current position of the motor output shaft in rad
- $v_{des}$ is the desired velocity of the motor output shaft in rad/s
- $d\theta_{m}$ is the current velocity of the motor output shaft in rad/s
