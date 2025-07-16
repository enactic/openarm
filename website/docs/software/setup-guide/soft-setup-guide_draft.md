---
title: Getting started 
sidebar_position: 1
---

# Software setup guide

## Supported Environment

### SDK Requirements
- **openarm_sdk**: Works on Ubuntu with SocketCAN interface devices
  - Tested on Ubuntu 22.04 
  - **TODO**: Test compatibility on Ubuntu 24.04 (@kevin)
- **CMake 3.22+** required for building

### Other Package Dependencies
- **openarm_ros2**: Compatible with ROS2 Humble
- **openarm_isaac** (Work in Progress): Requires Ubuntu 22.04 + ROS2 Humble-based bridge

## Building the SDK

### 1. Clone and Initialize Repository
```bash
git clone https://github.com/enactic/openarm_sdk.git
cd openarm_sdk
git submodule update --init --recursive
```

### 2. Build the CAN Library
```bash
cd openarm_can
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build
sudo cmake --install build
```

### 3. Optional: ROS2 Integration
- If using URDF files directly, no additional configuration needed
- For custom ROS2 setup with xacro, DAE files, etc., configure ROS2 workspace accordingly

## Pre-Flight Configuration

### Motor ID Configuration
**CRITICAL**: Configure Damiao motor IDs before running any code on the arm.

Follow the [Damiao motor configuration guide](https://wiki.seeedstudio.com/damiao_series/) to set up motor IDs as follows:

| Joint | Sender CAN ID | Receiver (Master) ID |
|-------|---------------|---------------------|
| J1    | 0x01          | 0x11               |
| J2    | 0x02          | 0x12               |
| J3    | 0x03          | 0x13               |
| J4    | 0x04          | 0x14               |
| J5    | 0x05          | 0x15               |
| J6    | 0x06          | 0x16               |
| J7    | 0x07          | 0x17               |
| J8 (Gripper) | 0x08   | 0x18               |

### Firmware Version Check
Verify your motor firmware version is compatible:
**TODO**: Determine minimum required firmware version

## Arm Configuration

Configure your CAN device baudrate and motor baudrate and communication mode. $They need to MATCH!$


### CAN Configuration

can interface can be configured using `ip link`:

```
sudo ip link set $CAN_INTERFACE down

# CAN 2.0
# sudo ip link set $CAN_IF type can bitrate $BITRATE

# CAN FD
sudo ip link set $CAN_INTERFACE type can bitrate $BITRATE dbitrate $DBITRATE fd on

sudo ip link set $CAN_INTERFACE
```

Here are some preset scripts [here](https://github.com/enactic/openarm_can/blob/main/scripts/can_setup.md) for CAN interface setup

```
./configure_socketcan.sh $CAN_INTERFACE
./configure_socketcan.sh can0 -fd -b 1000000 -d 5000000
```

### Motor Baudrate Configuration

To modify a motor's baudrate, the following procedure must be followed:

1. Configure the CAN interface to operate at the current baudrate of the motor.
2. Issue the command to update the baudrate 
3. write the new value to the appropriate motor register.

One need to ensure that the write operation is performed at a baudrate the motor can still interpret immediately after the change.

Important considerations:

Under the current firmware version of motors: 
- CAN 2.0 frames → CAN FD motor: Motor respond to the commands but provides no feedback
- CAN FD frames → CAN 2.0 motor: Motor doesn't respond

Therefore during the baudrate transition process, it is strongly advised to perform the change using CAN 2.0.

⚠️ **WARNING**: Motors have a hard limit of 10,000 parameter write cycles

```bash
# Change motor baudrate (use sparingly)
./build/bin/change_baudrate $SEND_CAN_ID $RECV_CAN_ID $FD$ $NEW_BAUDRATE
```
**TODO**: Implement `build/bin/change_baudrate` utility

### 3. Zero Position Calibration
This step is crucial for proper arm operation:

1. **Physical Setup**: Manually position the arm to zero position according to hardware documentation
2. **Set Zero Position**: Run the zero-setting script
```bash
./build/bin/set_zero
```
**TODO**: Implement `build/bin/set_zero` or create bash script with cansend commands

### 4. Parameter Verification
Read and verify motor parameters:
```bash
./build/bin/read_motor_param
```
**TODO**: Implement `build/bin/read_motor_param` utility

## Testing Communication

### Basic Communication Test
After completing all configuration steps:

```bash
./build/bin/example
```

This example should demonstrate:
- Successful CAN communication with all joints
- Motor status readings
- Basic movement commands

### Troubleshooting
If communication fails:
1. Verify CAN interface is up and configured correctly (Leverage `candump` to monitor the communication)
2. Check motor ID configurations
3. Confirm baudrate matching between CAN interface and motors
4. Ensure zero position has been set
5. Check wiring

## Additional Resources

### TODO Items
- [ ] **REPO_URL**: Add actual repository URL
- [ ] **Firmware version**: Determine and document minimum required version
- [ ] **change_baudrate**: Implement baudrate configuration utility
- [ ] **set_zero**: Implement zero position setting utility or bash script
- [ ] **read_motor_param**: Implement parameter reading utility
- [ ] **Ubuntu 24.04 testing**: Verify compatibility (@kevin)

### Links to be Instantiated
- [Hardware documentation]: **TODO** - Add link to hardware setup guide
- [Damiao motor configuration guide](https://wiki.seeedstudio.com/damiao_series/) - ✅ Active link
- [openarm_can README]: **TODO** - Ensure detailed CAN setup instructions exist

## Safety Notes
- Always ensure emergency stops are accessible when testing
- Start with low-speed movements during initial testing:
- Verify zero position is correctly set before attempting complex movements
- Monitor motor temperatures during extended operation
