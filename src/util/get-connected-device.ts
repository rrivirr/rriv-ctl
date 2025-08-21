import { SerialPort } from "serialport";

export const getConnectedDevice = async () => {
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

  // @TODO get the details of the device; serialNumber; hardware version; software version; etc
  return {
    serialPortPath,
    serialNumber: "default",
  };
};
