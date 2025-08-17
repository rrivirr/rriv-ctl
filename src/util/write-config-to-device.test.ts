import { ReadlineParser } from "serialport";
import * as ConnectSerialModule from "./connect-serial.ts";
import * as GetSerialPathModule from "./get-serial-path-from-cache.ts";
import { writeConfigToDevice } from "./write-config-to-device.ts";

jest.mock("serialport");

describe("writeConfigToDevice", () => {
  const serialPortMock = { write: jest.fn(), pipe: jest.fn() };
  const connectSerialSpy = jest.spyOn(ConnectSerialModule, "connectSerial");
  const getSerialPortSpy = jest.spyOn(
    GetSerialPathModule,
    "getSerialPathFromCache"
  );

  it("writeConfigToDevice", () => {
    const payload = {
      now: Date.now(),
      genre: "highlife",
      tempo: "smooth",
    };
    const serialPortPath = "/device2/rriv";
    getSerialPortSpy.mockReturnValue(serialPortPath);
    connectSerialSpy.mockReturnValue(serialPortMock as any);
    logConsoleSpy.mockImplementation();

    writeConfigToDevice(payload);

    const mockParserInstance = (
      ReadlineParser as jest.MockedClass<typeof ReadlineParser>
    ).mock.instances[0];
    expect(logConsoleSpy).toHaveBeenCalledTimes(1);
    expect(logConsoleSpy).toHaveBeenCalledWith(
      "payloadString",
      JSON.stringify(payload) + "\n"
    );
    expect(getSerialPortSpy).toHaveBeenCalledTimes(1);
    expect(getSerialPortSpy).toHaveBeenCalledWith();
    expect(connectSerialSpy).toHaveBeenCalledTimes(1);
    expect(connectSerialSpy).toHaveBeenCalledWith(serialPortPath);
    expect(serialPortMock.write).toHaveBeenCalledTimes(2);
    expect(serialPortMock.write).toHaveBeenNthCalledWith(
      1,
      '{"object":"datalogger", "action":"set_mode", "mode":"quiet"}\n'
    );
    expect(serialPortMock.write).toHaveBeenNthCalledWith(
      2,
      JSON.stringify(payload) + "\n"
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
    const payload = {
      now: Date.now(),
      genre: "jazz",
      tempo: "seamless",
    };
    const serialPortPath = "/device2/rriv";

    const consoleLogSpy = jest.spyOn(console, "log");
    const processExitSpy = jest.spyOn(process, "exit");
    getSerialPortSpy.mockReturnValue(serialPortPath);
    connectSerialSpy.mockReturnValue(serialPortMock as any);

    writeConfigToDevice(payload);

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
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith("echo: {one:two}");
    });

    it("parserAnonFunction: should call process.exit", () => {
      expect(() => parserAnonFunction("string")).toThrow("EXIT");

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith("string");
      expect(processExitSpy).toHaveBeenCalledTimes(1);
      expect(processExitSpy).toHaveBeenCalledWith();
    });
  });
});
