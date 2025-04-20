import { SerialPort } from "serialport";

export const getConnectedDevice = async () => {
  return {
    serialPortPath: "portpath",
    serialNumber: "serialNumber",
  };
  const list = await SerialPort.list();
  // detect the serial port
  let serialPortPath = "";
  for (const pathItem of list) {
    if (pathItem.productId && pathItem.pnpId?.includes("rriv")) {
      console.log(`Found a RRIV device ${pathItem.pnpId}`);
      console.log(`Connecting to it at ${pathItem.path}`);
      serialPortPath = pathItem.path;
      break;
    }
  }
  if (!serialPortPath) {
    console.log("No RRIV device found");
    process.exit(1);
  }

  // get the details of the device; serialNumber; hardware version; software version; etc
  return {
    serialPortPath,
    serialNumber: "default",
  };
};
