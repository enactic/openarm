---
sidebar_position: 3
---

# CAN Library Testing

How to use the [`openarm_can`](https://github.com/enactic/openarm_can) library.

---

## Hardware Setup

### Basic Connections

[img to be added here]

- **CANH / CANL**: Connect all motors in a daisy-chain configuration
- **GND**: Daisy-chain all motor grounds to PSU ground (GND from CAN adapter not required)
- **Power**: Supply power to all motors via PSU with 24V and ensure appropriate current is provided for number of motors connected
- **CAN Adapter**: Ensure correct connection to PC (USB-to-CAN device)

:::note[T30 2+2 Wiring Warning:]
If soldering your own connector wires, double check CANH is connected to CANH and CANL to CANL as the ports "flips" between motors due to mirroring
:::

---

## Software Setup

### 1. Clone the CAN Library

```bash
git clone https://github.com/openarm-dev/openarm_can.git
cd openarm_can
```

### 2. Configure CAN Interface

> Replace `can0` with your interface name if different

#### CAN 2.0

```bash
./scripts/configure_socketcan.sh can0
```

#### CAN FD

```bash
./scripts/configure_socketcan.sh can0 -fd
```

> Might require `can-utils`:

```bash
sudo apt install can-utils
```

---

## Build the Library

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build
sudo cmake --install build
```

---

## Configure Demo Script

- Head to

```bash
openarm_can/examples/demo.cpp
```

- Find this section:

``` cpp
// Initialize arm motors
        std::vector<openarm::damiao_motor::MotorType> motor_types = {
            openarm::damiao_motor::MotorType::DM4310, openarm::damiao_motor::MotorType::DM4340};
        std::vector<uint32_t> send_can_ids = {0x01, 0x02};
        std::vector<uint32_t> recv_can_ids = {0x11, 0x12};
```
- Add/change motor types to match your motors in the first function
- Add/change sender IDs to match your motors in the second function
- Add/change master IDs to match your motors in the third function
---

## Run the Demo

```bash
cd examples
g++ demo.cpp -std=c++17 -I../include -L/usr/local/lib -lopenarm_can -o demo
./demo
```

---

## Results

- **Green LED on motor**: Motor is communicating via CAN (CAN OK)
- **Movement**: Motor is rotating (Motor is working as intended)

---

## Known Issues:

- **No movement**: Check for wiring, ID conflicts, or possible command issues
- **Motor stalling after running demo 2-3 times**: Likely triggered the built-in failsafe or overcurrent protection, nothing wrong, just reconnect power to the motor and double check provided current.

---

## Important: Set Unique Motor IDs

Ensure each motor on the CAN bus has a unique ID set via hardware or configuration tool.

---

## Debugging Tools

Install if not already installed:

```bash
sudo apt update
sudo apt install can-utils
```

Use `candump` to inspect raw CAN traffic:

```bash
candump can0
```

---

Let us know on GitHub if you encounter persistent issues or need help with debugging.
