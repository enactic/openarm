---
sidebar_position: 1
---

# Questions

## Where is the OpenArm 1.0 documentation?

This site shows the latest documentation (OpenArm 2.0) by default.
To view the OpenArm 1.0 documentation, use the version dropdown in the top right of the navigation bar,
or go directly to [the 1.0 documentation](/1.0/).

## Is there a mobile base?

The OpenArm project does not currently have any short-term plans for a mobile base.
Please consider integrating it with another project, for more information, refer to [this GitHub issue](https://github.com/enactic/openarm/issues/219).

## The motor is not working.

See the [troubleshooting section](../setup/openarm-setup/1-motor-id.mdx#trouble-shooting).

## The arm stops moving or doesn't communicate.

Turn off the power, then check the following.
See also the [safety guide](../overview/safety-guide.mdx).

- Loose connectors and broken wires: a loose connector or a broken wire can stop a motor from moving or block communication.
  Check the connectors and wiring first.
  The wiring around the elbow (J4) comes off easily, so check it carefully.
- CAN bus-off: long wires or some cable routings can cause signal reflections that put the CAN bus into bus-off.
  This is rare, but it stops the arm.
  Bring the CAN interface down and up again to restore communication. See [Setup CAN Interface](../setup/openarm-setup/2-can-setup.mdx).
- Termination resistors: the arm can stop working if a termination resistor is removed.
  Make sure the termination resistors are connected. See also [OpenArm CAN CLI troubleshooting](../api-reference/can/cli.mdx#troubleshooting).

## A connector comes off during operation.

Wrap the L-shaped connector with cable ties or tape so that it doesn't come off.
Turn off the power before working on it.

## The arm wobbles or its motion is unstable.

Turn off the power, then check the screws.

- Vibration during operation tends to loosen the screws around the wrist.
- Loose screws around the elbow can cause play in the joint and make the arm's motion unstable.

## Do you have any recommended CAN devices?

Please use the CAN-FD devices listed in the [OpenArm 1.0 Bill of Materials > Electronics](/1.0/hardware/bill-of-materials/electrical).
Using other CAN devices may result in unexpected behavior.

## How accurate and repeatable is it?

We're preparing the documentation.

## How much power does it consume?

We're preparing the documentation.

## Where can I get support?

You can also reach out to our community for tips and help.

- **Discord**
    Connect with other builders, researchers, and the OpenArm team for real-time support and discussions:
    [Join Now](https://discord.gg/GmYa262ETH)

- **GitHub Issues**
    Report bugs or request features directly in our repository:
    [Open an Issue](https://github.com/enactic/openarm/issues)

- **GitHub Discussions**
    Ask technical questions directly in our repository:
    [Start a Discussion](https://github.com/enactic/openarm/discussions)
