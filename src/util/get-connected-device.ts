import { SerialPort } from "serialport";
import { italic } from "yoctocolors";
import { getDeviceDetails } from "./get-device-details.ts";
import db from "../db/db.ts";

export const getConnectedDevice = async (
  specifiedSerialPortPath?: string,
  provisionCommand?: boolean
) => {
  let serialPortPath = "";
  let count = 0;
  let wait = false;

  const { device } = db.data;

  w: while (count < 50) {
    // detect the serial port
    const list = await SerialPort.list();
    for (const pathItem of list) {
      if (
        pathItem.productId &&
        (pathItem.pnpId?.includes("rriv") || pathItem.path?.includes("rriv"))
      ) {
        serialPortPath = pathItem.path;
        if (device.serialPortPath) {
          // to avoid logging each time
          console.log(
            `Connecting to device at ${device.serialPortPath === pathItem.path ? device.serialPortPath : pathItem.path}\n`
          );
          break w;
        }
        // pnpId not populated for macos
        console.log(`Found a RRIV device ${pathItem.pnpId || pathItem.path}`);
        console.log(`Connecting to it at ${pathItem.path}\n`);
        break w;
      }
    }

    if (specifiedSerialPortPath) {
      // port was specified; not found automatically
      break;
    }

    if (count === 0) {
      console.log("No RRIV device found");
      console.log("Waiting for a device");
      wait = true;
    }
    ++count;
    await new Promise((r) => setTimeout(r, 500));
  }

  if (!serialPortPath && !specifiedSerialPortPath) {
    console.log(
      "Try using -p <path> to specify the path to the RRIV serial device"
    );
    throw new Error(
      "No RRIV device found connected, ensure your device is plugged in"
    );
  }

  const { serialNumber, uid } = await getDeviceDetails(
    specifiedSerialPortPath || serialPortPath
  );

  if (serialNumber.includes("*")) {
    if (!provisionCommand) {
      throw new Error(
        `device not yet provisioned.\nrun ${italic("rrivctl provision device")} to set up the device`
      );
    }
  } else if (provisionCommand) {
    throw new Error(`device already provisioned`);
  }

  return {
    serialPortPath,
    serialNumber,
    uid,
    wait,
  };
};
