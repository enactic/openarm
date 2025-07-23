---
description: Setup guide for OpenArm robotic arm
---

# OpenArm Setup Guide

This guide walks you through setting up your OpenArm robotic arm from hardware connections to software testing. Follow each step in order for a successful setup.

## Step 0: Prerequisites & Requirements

Make sure you have motors and communication devices at your hands.

### Hardware Requirements
- OpenArm robotic arm with Damiao motors
- 24V power supply with appropriate current capacity
- Cables (the ones come with the motor package should be enough)

### Communication Device Requirements
- For Motor ID setup
  - Damiao USB CAN Debugger
  - Computer running Windows

- For CANFD baudrate configuration and control
  - SocketCAN-compatible interface device
  - Computer running Ubuntu 22.04/24.04 or other linux with SocketCAN support ([Install Ubuntu →](../ubuntu/))
