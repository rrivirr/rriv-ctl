import { SerialPort } from "serialport";

export const connectSerial = (serialPortPath: string) => {
  return new SerialPort({
    path: serialPortPath,
    baudRate: 57600,
  });
};
