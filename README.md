# OpenArm

**OpenArm** is an open-source 7DOF humanoid arm designed for physical AI research and deployment in contact-rich environments. With high backdrivability and compliance, it is built with safe human-robot interaction in mind while delivering practical payload capabilities for real-world applications.

<img alt="OpenArm in cell environment" src="website/static/img/hardware/openarm_and_cell.png" />

**OpenArm Cell** (on the right) is a standardized environment with unified background, lighting, and camera placement. Research performed using OpenArm can be reproduced around the world in consistent evaluation conditions, facilitating the global discussion on state of the art physical AI research.

OpenArm features **human-scale** proportions, safety and compliance, and practical payloads. At $6,500 USD for a complete bimanual system, it provides a flexible platform for teleoperation, imitation learning, simulation, and real-world data collection in contact-rich tasks.

*We're in continuous development and actively seeking contributors, research partners, and company collaborators to shape the next generation of practical humanoid systems. Ready to join the future of open-source robotics?*

> ### 📦 Purchase Your OpenArm!
> Get your **OpenArm**, assembled or DIY, and join the global community!  
> Browse verified and certified manufacturers worldwide. 
> 
> [**Buy Now →**](https://docs.openarm.dev/purchase)

## 🔗 Quick Links

| Platform | Description | Link |
|----------|-------------|------|
| **Website** | Project homepage and media | [openarm.dev](https://openarm.dev) |
| **Documentation** | Complete technical guides | [docs.openarm.dev](https://docs.openarm.dev) |
| **Discord** | Community discussions | [Join Discord](https://discord.gg/FsZaZ4z3We) |
| **Contact** | Direct communication | [openarm@enactic.ai](mailto:openarm@enactic.ai) |

## 📁 Repositories

Arm support: ◯ supported · △ adaptation and test needed · ◌ work in progress - incompatible

### Core

| Repository | Documentation | License | 1.0 | 2.0 | Description |
|------------|---------------|---------|:---:|:---:|-------------|
| **[openarm_hardware](https://github.com/enactic/openarm_hardware)** | [Docs](https://docs.openarm.dev/hardware) | [CERN-OHL-S-2.0](https://github.com/enactic/openarm_hardware/blob/main/LICENSE.txt) | ◯ | ◯ | CAD, STL and BOM for OpenArm, Cell and KER |
| **[openarm_description](https://github.com/enactic/openarm_description)** | [Docs](https://docs.openarm.dev/api-reference/description) | [Apache-2.0](https://github.com/enactic/openarm_description/blob/main/LICENSE.txt) | ◯ | ◯ | URDF/xacro robot description |
| **[openarm_can](https://github.com/enactic/openarm_can)** | [Docs](https://docs.openarm.dev/api-reference/can/) | [Apache-2.0](https://github.com/enactic/openarm_can/blob/main/LICENSE.txt) | ◯ | ◯ | CAN motor control library and CLI |
| **[openarm_ros2](https://github.com/enactic/openarm_ros2)** | [Docs](https://docs.openarm.dev/api-reference/ros2/install) | [Apache-2.0](https://github.com/enactic/openarm_ros2/blob/main/LICENSE) | ◯ | ◯ | ros2_control and MoveIt packages |
| **[openarm_mujoco](https://github.com/enactic/openarm_mujoco)** | [Docs](https://docs.openarm.dev/simulation/mujoco) | [Apache-2.0](https://github.com/enactic/openarm_mujoco/blob/master/LICENSE) | ◯ | ◯ | MuJoCo models, including the Cell scene |
| **[openarm_isaac_lab](https://github.com/enactic/openarm_isaac_lab)** | [Docs](https://docs.openarm.dev/simulation/isaac-lab) | [Apache-2.0](https://github.com/enactic/openarm_isaac_lab/blob/main/LICENSE.txt) | ◯ | ◌ | Isaac Lab environments and RL tasks |
| **[openarm_dataset](https://github.com/enactic/openarm_dataset)** | [Docs](https://docs.openarm.dev/dataset/) | [Apache-2.0](https://github.com/enactic/openarm_dataset/blob/main/LICENSE.txt) | ◯ | ◯ | Dataset format, Python API, LeRobot conversion |
| **[openarm_teleop](https://github.com/enactic/openarm_teleop)** | [Docs](https://docs.openarm.dev/teleop/) | [Apache-2.0](https://github.com/enactic/openarm_teleop/blob/main/LICENSE.txt) | ◯ | △ | Leader-follower teleoperation (1.0); for 2.0 see dora-rs below |

### dora-rs: teleoperation, data collection, inference

The [tutorial](https://docs.openarm.dev/tutorial/setup) runs on [dora-rs](https://dora-rs.ai/). Each `dora-openarm-*` repository is one node; a dataflow YAML wires nodes together and `dora run` starts the application. Swap nodes to go between real arms and MuJoCo, or between KER and VR. `openarm_ros2` is an independent stack on `openarm_can`; `dora-openarm-ros2` bridges the two.

| Repository | Documentation | License | 1.0 | 2.0 | Description |
|------------|---------------|---------|:---:|:---:|-------------|
| **[dora-openarm-data-collection](https://github.com/enactic/dora-openarm-data-collection)** | [Tutorial](https://docs.openarm.dev/tutorial/data-collection-webxr) | [Apache-2.0](https://github.com/enactic/dora-openarm-data-collection/blob/main/LICENSE) | △ | ◯ | Dataflows: KER / VR / WebXR, real or MuJoCo |
| **[dora-openarm-evaluation](https://github.com/enactic/dora-openarm-evaluation)** | [Tutorial](https://docs.openarm.dev/tutorial/inference) | [Apache-2.0](https://github.com/enactic/dora-openarm-evaluation/blob/main/LICENSE) | △ | ◯ | Dataflows: policy inference and evaluation |
| **[dora-openarm-\*](https://github.com/orgs/enactic/repositories?q=dora-openarm)** | [Docs](https://docs.openarm.dev/api-reference/dora) | Apache-2.0 | △ | ◯ | Nodes: arm, KER, VR, WebXR, kinematics, MuJoCo, observer, ROS 2, ... |

### OpenArm KER

A motorless leader arm with the same kinematics as OpenArm 2.0, used in the [KER tutorial](https://docs.openarm.dev/tutorial/data-collection-ker). CAD is in `openarm_hardware`.

| Repository | Documentation | License | 1.0 | 2.0 | Description |
|------------|---------------|---------|:---:|:---:|-------------|
| **[openarm_ker](https://github.com/enactic/openarm_ker)** | [Docs](https://docs.openarm.dev/hardware/openarm-ker/general) | [Apache-2.0](https://github.com/enactic/openarm_ker/blob/main/LICENSE.txt) | – | ◯ | PC-side library and CLI |
| **[openarm_ker_firmware](https://github.com/enactic/openarm_ker_firmware)** | [Docs](https://docs.openarm.dev/hardware/openarm-ker/encoder-module) | [Apache-2.0](https://github.com/enactic/openarm_ker_firmware/blob/main/LICENSE.txt) | – | ◯ | Encoder and M5 display firmware |

## 📄 Code of Conduct

All participation in the OpenArm project is governed by our [Code of Conduct](CODE_OF_CONDUCT.md).
