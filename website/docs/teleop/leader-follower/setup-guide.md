---
title: Setup Guide
sidebar_position: 1
---

# 🛠️ OpenArm Teleop - Setup Guide

This guide walks you through the steps to set up and build the `openarm_teleop` library.

Before proceeding, please ensure the following dependencies are satisfied:

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
sudo apt install -y software-properties-common
sudo add-apt-repository -y ppa:openarm/main
sudo apt update
sudo apt install -y \
  libeigen3-dev \
  libopenarm-can-dev \
  liborocos-kdl-dev \
  liburdfdom-dev \
  liburdfdom-headers-dev \
  libyaml-cpp-dev \
  openarm-can-utils
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
openarm-can-configure-socketcan can0 -fd
```

If you have all CAN interfaces (can0 to can3) connected, you can use the following command:

```bash
openarm-can-configure-socketcan-4-arms -fd
```
