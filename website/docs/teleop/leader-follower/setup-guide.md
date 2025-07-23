---
title: Setup Guide
sidebar_position: 1
---

# 🛠️ OpenArm Teleop - Setup Guide

This guide walks you through the steps to set up and build the `openarm_teleop` library.

Before proceeding, please ensure the following dependencies are satisfied:

- ✅ `openarm_can` library (see [OpenArm CAN library](/software/can))
- ✅ `openarm_description` library (see [OpenArm Description](/software/description))

---

## 🚀 Step 1: Clone the Teleop Repository

Clone the `openarm_teleop` repository and move into the directory:

```bash
git clone https://github.com/enactic/openarm_teleop.git
cd openarm_teleop
```

### 2. Install Dependancy

```bash
sudo apt update && sudo apt install -y \
  libopenarmcan-dev \
  liborocos-kdl-dev \
  libeigen3-dev \
  liburdfdom-dev \
  liburdfdom-headers-dev \
  libyaml-cpp-dev
```
### 3. Build the teleop library
```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build
```

### Step 4: Initialize the CAN Network

Each arm requires a dedicated CAN interface (1 arm = 1 CAN port).

To initialize a CAN interface (e.g., `can0`) in CAN FD mode, run:

```bash
cd openarm_can
./setup/configure_socketcan.sh can0 -fd
```








