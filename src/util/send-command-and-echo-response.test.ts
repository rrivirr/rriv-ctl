import { ReadlineParser } from "serialport";
import * as ConnectSerialModule from "./connect-serial.ts";
import * as GetSerialPathModule from "./get-serial-path-from-cache.ts";
import { sendCommandAndEchoResponse } from "./send-command-and-echo-response.ts";

jest.mock("serialport");
jest.useFakeTimers();

describe("sendCommandAndEchoResponse", () => {
  const drainFunction = jest.fn();
  const serialPortMock = {
    write: jest.fn(),
    pipe: jest.fn(),
    flush: jest.fn(),
    drain: drainFunction,
  };
  const connectSerialSpy = jest.spyOn(ConnectSerialModule, "connectSerial");
  const getSerialPortSpy = jest.spyOn(
    GetSerialPathModule,
    "getSerialPathFromCache"
  );

  it("sendCommandAndEchoResponse", () => {
    const command = "attack";
    const serialPortPath = "/device3/rriv";

    drainFunction.mockImplementation((callback: Function) => {
      callback();
    });
    connectSerialSpy.mockReturnValue(serialPortMock as any);
    getSerialPortSpy.mockReturnValue(serialPortPath);

    sendCommandAndEchoResponse(command);
    jest.runAllTimers();

    const mockParserInstance = (
      ReadlineParser as jest.MockedClass<typeof ReadlineParser>
    ).mock.instances[0];
    expect(getSerialPortSpy).toHaveBeenCalledTimes(1);
    expect(getSerialPortSpy).toHaveBeenCalledWith();
    expect(connectSerialSpy).toHaveBeenCalledTimes(1);
    expect(connectSerialSpy).toHaveBeenCalledWith(serialPortPath);
    expect(ReadlineParser).toHaveBeenCalledWith({
      delimiter: "\n",
      includeDelimiter: false,
    });
    expect(serialPortMock.write).toHaveBeenCalledTimes(2);
    expect(serialPortMock.write).toHaveBeenNthCalledWith(
      1,
      '{"object":"datalogger", "action":"set_mode", "mode":"quiet"}\n'
    );
    expect(serialPortMock.write).toHaveBeenNthCalledWith(2, command);
    expect(serialPortMock.flush).toHaveBeenCalledTimes(1);
    expect(serialPortMock.flush).toHaveBeenCalledWith();
    expect(serialPortMock.drain).toHaveBeenCalledTimes(1);
    expect(serialPortMock.pipe).toHaveBeenCalledTimes(1);
    expect(serialPortMock.pipe).toHaveBeenCalledWith(mockParserInstance);
    expect(mockParserInstance.on).toHaveBeenCalledTimes(1);
  });

  describe("parser anon function", () => {
    const command = "defence";
    const serialPortPath = "/device4/rriv";

    drainFunction.mockImplementation((callback: Function) => {
      callback();
    });
    connectSerialSpy.mockReturnValue(serialPortMock as any);
    getSerialPortSpy.mockReturnValue(serialPortPath);
    const processExitSpy = jest.spyOn(process, "exit");
    const consoleLogSpy = jest.spyOn(console, "log");
    const consoleWarnSpy = jest.spyOn(console, "warn");

    sendCommandAndEchoResponse(command);
    jest.runAllTimers();

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

    it("parserAnonFunction: should return undefined; contains action", () => {
      const result = parserAnonFunction("{one:action:two}");

      expect(result).toEqual(undefined);
      expect(processExitSpy).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it("parserAnonFunction: data is not a json string", () => {
      expect(() => parserAnonFunction("data")).toThrow("EXIT");

      expect(processExitSpy).toHaveBeenCalledTimes(1);
      expect(processExitSpy).toHaveBeenCalledWith();
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith("data");
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith("response not json");
    });

    it("parserAnonFunction: data is a json", () => {
      expect(() => parserAnonFunction(`{"data":"gigabyte"}`)).toThrow("EXIT");

      expect(processExitSpy).toHaveBeenCalledTimes(1);
      expect(processExitSpy).toHaveBeenCalledWith();
      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, `{"data":"gigabyte"}`);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(
        2,
        JSON.stringify({ data: "gigabyte" }, null, 2)
      );
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });
});
