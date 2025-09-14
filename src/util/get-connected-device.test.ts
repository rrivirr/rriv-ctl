import { randomUUID } from "crypto";
import { SerialPort } from "serialport";
import { getConnectedDevice } from "./get-connected-device.ts";

jest.mock("serialport");

describe("getConnectedDevice", () => {
  const consoleLogSpy = jest.spyOn(console, "log");
  const listSerialPortSpy = jest.spyOn(SerialPort, "list");
  const processExitSpy = jest.spyOn(process, "exit");

  beforeEach(() => {
    processExitSpy.mockImplementation(() => {
      throw new Error("EXIT");
    });
  });

  it("no device found: empty list", async () => {
    listSerialPortSpy.mockResolvedValue([]);
    expect.assertions(7);

    try {
      await getConnectedDevice();
    } catch (e) {
      expect(e).toMatchObject(new Error("EXIT"));
    }

    expect(listSerialPortSpy).toHaveBeenCalledTimes(1);
    expect(listSerialPortSpy).toHaveBeenCalledWith();
    expect(processExitSpy).toHaveBeenCalledTimes(1);
    expect(processExitSpy).toHaveBeenCalledWith(1);
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith("No RRIV device found");
  });

  it("no device found: non empty list", async () => {
    listSerialPortSpy.mockResolvedValue([
      {
        vendorId: randomUUID(),
        locationId: randomUUID(),
        manufacturer: randomUUID(),
        path: randomUUID(),
        pnpId: randomUUID(),
        serialNumber: randomUUID(),
        productId: randomUUID(),
      },
    ]);
    expect.assertions(7);

    try {
      await getConnectedDevice();
    } catch (e) {
      expect(e).toMatchObject(new Error("EXIT"));
    }

    expect(listSerialPortSpy).toHaveBeenCalledTimes(1);
    expect(listSerialPortSpy).toHaveBeenCalledWith();
    expect(processExitSpy).toHaveBeenCalledTimes(1);
    expect(processExitSpy).toHaveBeenCalledWith(1);
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith("No RRIV device found");
  });

  it("valid device found", async () => {
    const deviceInfo = {
      vendorId: randomUUID(),
      locationId: randomUUID(),
      manufacturer: randomUUID(),
      path: randomUUID(),
      pnpId: `rriv${randomUUID()}`,
      serialNumber: randomUUID(),
      productId: randomUUID(),
    };
    listSerialPortSpy.mockResolvedValue([deviceInfo]);

    const device = await getConnectedDevice();

    expect(device).toEqual({
      serialPortPath: deviceInfo.path,
      serialNumber: device.serialNumber,
    });
    expect(listSerialPortSpy).toHaveBeenCalledTimes(1);
    expect(listSerialPortSpy).toHaveBeenCalledWith();
    expect(processExitSpy).toHaveBeenCalledTimes(0);
    expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `Found a RRIV device ${deviceInfo.pnpId}`
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `Connecting to it at ${deviceInfo.path}`
    );
  });
});
