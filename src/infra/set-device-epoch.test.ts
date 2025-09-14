import { ReadlineParser } from "serialport";
import * as ConnectSerialModule from "./connect-serial.ts";
import { setDeviceEpoch } from "./set-device-epoch.ts";

jest.mock("serialport");

describe("setDeviceEpoch", () => {
  it("setDeviceEpoch", () => {
    const mockDate = -14159040000;
    const serialPortPath = "/device/rriv";
    jest.spyOn(Date, "now").mockReturnValue(mockDate);
    const serialPortMock = { write: jest.fn(), pipe: jest.fn() };
    const connectSerialSpy = jest
      .spyOn(ConnectSerialModule, "connectSerial")
      .mockReturnValue(serialPortMock as any);

    setDeviceEpoch(serialPortPath);

    const mockParserInstance = (
      ReadlineParser as jest.MockedClass<typeof ReadlineParser>
    ).mock.instances[0];
    expect(connectSerialSpy).toHaveBeenCalledTimes(1);
    expect(connectSerialSpy).toHaveBeenCalledWith(serialPortPath);
    expect(serialPortMock.write).toHaveBeenCalledTimes(2);
    expect(serialPortMock.write).toHaveBeenNthCalledWith(
      1,
      '{"object":"datalogger", "action":"set_mode", "mode":"quiet"}\n'
    );
    expect(serialPortMock.write).toHaveBeenNthCalledWith(
      2,
      JSON.stringify({
        object: "board",
        action: "set",
        epoch: mockDate / 1000,
      }) + "\n"
    );
    expect(ReadlineParser).toHaveBeenCalledWith({
      delimiter: "\n",
      includeDelimiter: false,
    });

    expect(serialPortMock.pipe).toHaveBeenCalledTimes(1);
    expect(serialPortMock.pipe).toHaveBeenCalledWith(mockParserInstance);
    expect(mockParserInstance.on).toHaveBeenCalledTimes(1);
  });

  describe("parser anon function", () => {
    const serialPortPath = "/device/rriv";
    const serialPortMock = { write: jest.fn(), pipe: jest.fn() };
    jest
      .spyOn(ConnectSerialModule, "connectSerial")
      .mockReturnValue(serialPortMock as any);
    const processExitSpy = jest.spyOn(process, "exit");

    setDeviceEpoch(serialPortPath);

    const mockParserInstance = (
      ReadlineParser as jest.MockedClass<typeof ReadlineParser>
    ).mock.instances[0];

    const parserAnonFunction = (
      mockParserInstance.on as jest.MockedFunction<typeof mockParserInstance.on>
    ).mock.calls[0][1];

    beforeEach(() => {
      processExitSpy.mockImplementation(() => {
        throw new Error("EXIT");
      });
    });

    it("parserAnonFunction: should return undefined", () => {
      const result = parserAnonFunction("{one:two}");

      expect(result).toEqual(undefined);
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it("parserAnonFunction: should call process.exit", () => {
      expect(() => parserAnonFunction("string")).toThrow("EXIT");

      expect(processExitSpy).toHaveBeenCalledTimes(1);
      expect(processExitSpy).toHaveBeenCalledWith();
    });
  });
});
