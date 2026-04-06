import { SerialPort } from "serialport";
import { italic } from "yoctocolors";
import { PortInfo } from "@serialport/bindings-cpp";
import { select } from "@inquirer/prompts";
import { getDeviceDetails } from "./get-device-details.ts";
import { getActiveUser } from "./get-logged-in-user.ts";

export const getConnectedDevice = async (body: {
  specifiedSerialPortPath?: string;
  provisionCommand?: boolean;
  fromRunCheck?: boolean;
  getPath?: boolean;
}) => {
  const { specifiedSerialPortPath, provisionCommand, fromRunCheck, getPath } =
    body;
  let serialPortPath = "";
  let count = 0;

  const { device } = getActiveUser();

  if (!specifiedSerialPortPath) {
    while (count < 50) {
      // detect the serial port
      const list = await SerialPort.list();
      const rrivDevices = list.filter((l) => l.manufacturer === "RRIV");
      const numOfRrivDevices = rrivDevices.length;
      if (!numOfRrivDevices) {
        if (count === 0 && !provisionCommand) {
          console.log("No RRIV device found");
          console.log("Waiting for a device");
        }
        ++count;
        await new Promise((r) => setTimeout(r, 500));
      } else {
        let selectedDevice: PortInfo;
        if (numOfRrivDevices === 1) {
          selectedDevice = rrivDevices[0];
        } else {
          const answer = await select({
            message: "Choose a rriv device to connect to",
            choices: rrivDevices.map((r) => ({
              name: `${r.path}:${r.serialNumber}`,
              value: r.path,
            })),
          });
          selectedDevice = rrivDevices.find((r) => r.path === answer)!;
        }
        serialPortPath = selectedDevice.path;
        if (getPath) {
          return { serialPortPath };
        }

        if (device.serialPortPath || fromRunCheck) {
          // to avoid logging each time
          break;
        }
        console.log(`Found a RRIV device at ${selectedDevice.path}`);
        break;
      }
    }
  }

  if (!serialPortPath && !specifiedSerialPortPath) {
    if (provisionCommand) {
      return;
    }
    console.log(
      "Try using rrivctlv2 connect -p <path> to specify the path to the RRIV serial device",
    );
    throw new Error(
      "No RRIV device found connected, ensure your device is plugged in",
    );
  }

  const { serialNumber, uid } = await getDeviceDetails(
    specifiedSerialPortPath || serialPortPath,
  );

  if (serialNumber.includes("*")) {
    if (!provisionCommand) {
      throw new Error(
        `device not yet provisioned.\nrun ${italic("rrivctlv2 provision device")} to set up the device`,
      );
    }
  } else if (provisionCommand) {
    throw new Error(`device already provisioned`);
  }

  return {
    serialPortPath: specifiedSerialPortPath || serialPortPath,
    serialNumber,
    uid,
  };
};
