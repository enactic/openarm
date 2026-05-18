---
sidebar_position: 1
description: software-overview
---

# OpenArm Software Guide

Welcome to the OpenArm software ecosystem! We're building a toolkit for bridging the bimanual robot (and we'd love your help making it even better).

## 🚀 What to Expect (and Growing!)

The OpenArm software ecosystem is continuously evolving, offering tools that bridge hardware and intelligent control:

- **Robot Description**: Modularized XACRO files for generating URDF robot models for controls and simulation
- **Low-Level Control APIs**: High-frequency control package allows direct interaction with motors
- **🚧 ROS2 Integration**: Standard robotics middleware compatibility
- **🚧 Control Algorithms**: System identification and advanced control strategies

*Many of these components are actively being developed and improved. We welcome contributions, feedback, and collaboration!*

## 🛠️ Getting Started

**New to OpenArm?** Start with our [Setup Guide](setup) to configure your development environment.

**Want to contribute?** Each section below has opportunities for improvement and extension.

## 🛣️ Available Components

### Robot Description

**[Learn more under Robot Description →](description)**

URDF and XACRO files that provide representations of OpenArm. These models enable simulation, motion planning, and visualization. The package supports both single-arm and bimanual configurations.

---

### SocketCAN Communication

**[Learn more under SocketCAN Communication →](can)**

A C++ library for communicating with OpenArm motors through Linux's SocketCAN interface. Enables real-time control loops and motor coordination. Offers Python bindings for seamless integration with other frameworks.

---


### ROS2 Integration

**[Learn more under ROS2 →](ros2/install)**

Middleware for connecting OpenArm with the broader ROS2 ecosystem. Enables compatibility with existing robotics tools and frameworks.

- **Current features**: ROS2 control and hardware interfaces and moveit configurations for basic motion planning
- **In development**: Efficient hardware bridging node for direct control
- **Help wanted**: Support for additional ROS2 distributions, testing and validation

---



## 🤝 Join the Community

- 💬 Connect with us on [Discord](https://discord.com/invite/FsZaZ4z3We)
- 🐞 Report bugs or request features via GitHub issues in each repository
- 🔥 Contribute by submitting pull requests
- 📧 Reach out at [openarm@enactic.ai](mailto:openarm@enactic.ai)

*The OpenArm ecosystem grows stronger with every contribution. Ready to help build the future of accessible robotics?*
