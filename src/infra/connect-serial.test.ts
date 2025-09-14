import { randomUUID } from "crypto";
import { SerialPort } from "serialport";
import { connectSerial } from "./connect-serial.ts";

jest.mock("serialport", () => {
  return {
    SerialPort: jest.fn().mockImplementation(),
  };
});

describe("connectSerial", () => {
  const baudRate = 57600;

  it("connectSerial", () => {
    const serialPortPath = randomUUID();
    const result = connectSerial(serialPortPath);

    expect(result).toBeInstanceOf(SerialPort);
    expect(SerialPort).toHaveBeenCalledWith({
      path: serialPortPath,
      baudRate,
    });
  });
});
