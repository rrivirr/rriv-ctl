import { SerialPort } from "serialport";

export const getConnectedDevice = async (defaultSerialPortPath?: string) => {
  let serialPortPath = "";
  let count = 0;
  let wait = false;

  w: while (count < 50) {
    // detect the serial port
    const list = await SerialPort.list();
    for (const pathItem of list) {
      if (pathItem.productId && pathItem.pnpId?.includes("rriv")) {
        if (defaultSerialPortPath) {
          break w;
        }
        console.log(`Found a RRIV device ${pathItem.pnpId}`);
        console.log(`Connecting to it at ${pathItem.path}`);
        serialPortPath = pathItem.path;
        break w;
      }
    }
    if (count === 0) {
      console.log("No RRIV device found");
      console.log("Waiting for a device");
      wait = true;
    }
    ++count;
    await new Promise((r) => setTimeout(r, 500));
  }

  if (!serialPortPath) {
    console.log(
      "Try using -p <path> to specify the path to the RRIV serial device"
    );
    throw new Error(
      "No RRIV device found connected, ensure your device is plugged in"
    );
  }

  // @TODO get the details of the device; serialNumber; hardware version; software version; etc
  return {
    serialPortPath,
    serialNumber: "default",
    wait,
  };
};
