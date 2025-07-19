---
description: OpenArm SDK - Robot description, SocketCAN communication
---

# SDK

The OpenArm SDK provides comprehensive tools and libraries for developing applications on OpenArm. This section covers the essential software components needed to get started with OpenArm development.

## Overview

The SDK includes:
- **Robot Description**: URDF(Unified Robot Description Format) files and XACRO macros for accurate robot modeling
- **Socket CAN Communication**: Low-level C++ control library for ARM-based systems

## Quick Start

1. **Build Instructions**: Follow the [Setup Guide](/software/setup) for building and configuring the SDK
2. **Robot Description**: Start with the [Robot Description](openarm-description) page to understand the OpenArm robot description package structure
3. **Socket CAN Communication**: Set up [SocketCAN Communication](openarm-can) for low-level control

## Robot Description

The robot description contains OpenArm URDF files and relevant XACRO macros for accurate robot modeling. These files provide the complete kinematic and dynamic representation of the OpenArm system.

[Learn more about Robot Description →](openarm-description)

## SocketCAN Communication

The [openarm_can](https://github.com/enactic/openarm_can) library enables low-level C++ control SDK on Linux based systems using SocketCAN interface and devices. This library provides direct hardware access for real-time control applications.

[Learn more about SocketCAN Communication →](openarm-can)
