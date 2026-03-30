import { SerialPort } from "serialport";
import { italic } from "yoctocolors";
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
  let wait = false;

  const { device } = getActiveUser();

  if (!specifiedSerialPortPath) {
    w: while (count < 50) {
      // detect the serial port
      const list = await SerialPort.list();
      for (const pathItem of list) {
        if (
          pathItem.productId &&
          (pathItem.pnpId?.includes("rriv") || pathItem.path?.includes("rriv"))
        ) {
          serialPortPath = pathItem.path;
          if (getPath) {
            return { serialPortPath };
          }
          if (device.serialPortPath || fromRunCheck) {
            // to avoid logging each time
            break w;
          }
          // pnpId not populated for macos
          console.log(`Found a RRIV device ${pathItem.pnpId || pathItem.path}`);
          console.log(`Connecting to it at ${pathItem.path}\n`);
          break w;
        }
      }

      if (count === 0 && !provisionCommand) {
        console.log("No RRIV device found");
        console.log("Waiting for a device");
        wait = true;
      }
      ++count;
      await new Promise((r) => setTimeout(r, 500));
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
    wait,
  };
};
