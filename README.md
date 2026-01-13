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

## Initial setup

After you have run the NPM commands above and have plugged in a RRIV board via USB, you can connect to the device.<br><br>

- In the terminal, enter the following command to connect to your RRIV device: `rrivctl connect`
- To configure your device, use the following settings command. This will allow you to set `site_name` (the location where the sensor has been deployed), `logger_name` (the identification ID of the board you are using), and the `deployment_identifier`, which can be used to indicate the reason for deploying a given sensor:

```
rrivctl set datalogger {"site_name":"SITE","logger_name":"BOARD_ID","deployment_identifier":"ID"}
```

-

## Configure the ring temperature sensor

rrivctlv2 set sensor RING01 -f configurations/ring_temperature.json
