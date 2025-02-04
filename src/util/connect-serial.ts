import { SerialPort } from "serialport";

export const connectSerial = (serialPath: string) => {
  return new SerialPort({
    path: serialPath,
    baudRate: 57600,
  });
};
