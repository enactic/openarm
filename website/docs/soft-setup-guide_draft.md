# Robot Arm Starting Guide

## Supported Environment

### Core SDK Requirements
- **openarm_sdk**: Works on Ubuntu with SocketCAN interface devices
  - Tested on Ubuntu 22.04 
  - **TODO**: Test compatibility on Ubuntu 24.04 (@kevin)
- **CMake 3.22+** required for building

### Peripheral Package Dependencies
- **openarm_ros2**: Compatible with ROS2 Humble
- **openarm_isaac** (Work in Progress): Requires Ubuntu 22.04 + ROS2 Humble-based bridge

## Building the SDK

### 1. Clone and Initialize Repository
```bash
git clone [REPO_URL] openarm_sdk
cd openarm_sdk
git submodule update --init --recursive
```

### 2. Build the CAN Library
```bash
cd openarm_can
mkdir build
cd build
cmake ..
make
sudo make install
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
```bash
./build/bin/check_firmware_version
```
**TODO**: Determine minimum required firmware version

## Arm Configuration

### 1. CAN Interface Setup
Configure your CAN device baudrate to match motor settings:

```bash
# See openarm_can README for detailed CAN interface setup
sudo ip link set can0 up type can bitrate 1000000
```

**Reference**: See `openarm_can/README.md` for complete CAN interface configuration

### 2. Motor Baudrate Configuration
⚠️ **WARNING**: Motors have a hard limit of 10,000 parameter write cycles

```bash
# Change motor baudrate (use sparingly)
./build/bin/change_baudrate [NEW_BAUDRATE]
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
1. Verify CAN interface is up and configured correctly
2. Check motor ID configurations
3. Confirm baudrate matching between CAN interface and motors
4. Ensure zero position has been set

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
- Start with low-speed movements during initial testing
- Verify zero position is correctly set before attempting complex movements
- Monitor motor temperatures during extended operation
