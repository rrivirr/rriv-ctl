# rriv-client

The client app for RRIV hardware.

# regular use

For regular use, switch to the `v1` branch. The main branch is for active development and may be unstable.

# Installation

To **install** rrivctl, run the following command in the terminal

```sh
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/rrivirr/rriv-ctl/releases/latest/download/rrivctl-installer.sh | bash
```

To **install** a released version of rrivctl including either alpha or beta versions, run the following command in the terminal

```sh
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/rrivirr/rriv-ctl/releases/download/<version>/rrivctl-installer.sh | bash -s <version>
```

## Configure the ring temperature sensor

rrivctlv2 set sensor RING01 -f configurations/ring_temperature.json
