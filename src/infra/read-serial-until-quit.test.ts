import { ReadlineParser } from "serialport";
import * as fs from "fs";
import moment from "moment";
import { randomUUID } from "crypto";
import { readSerialUntilQuit } from "./read-serial-until-quit.ts";
import * as ConnectSerialModule from "./connect-serial.ts";
import paths from "./paths.ts";

jest.useFakeTimers();
jest.mock("moment");
jest.mock("serialport");
jest.mock("fs", () => {
  return {
    __esModule: true,
    ...jest.requireActual("fs"),
  };
});

describe("readSerialUntilQuit", () => {
  const drainFunction = jest.fn();
  const serialPortMock = {
    write: jest.fn(),
    pipe: jest.fn(),
    flush: jest.fn(),
    drain: drainFunction,
  };
  const connectSerialSpy = jest.spyOn(ConnectSerialModule, "connectSerial");
  const consoleLogSpy = jest.spyOn(console, "log");
  const getRRIVDirSpy = jest.spyOn(paths, "getRRIVDir");
  const fsExistsMock = jest.spyOn(fs, "existsSync");
  const fsMkdirMock = jest.spyOn(fs, "mkdirSync");
  const fsWriteFileMock = jest.spyOn(fs, "writeFileSync");
  const momentFormatMock = jest.fn();

  beforeEach(() => {
    drainFunction.mockImplementation((callback: Function) => {
      callback();
    });
    (moment as unknown as jest.Mock).mockImplementation(() => ({
      format: momentFormatMock,
    }));
  });

  it("directory exist and debug is true", () => {
    const serialPortPath = randomUUID();
    const file = `folder/file`;
    const firstDir = randomUUID();
    const secondDir = randomUUID();
    const rrivDir = `${firstDir}/${secondDir}`;

    fsExistsMock.mockReturnValue(true);
    getRRIVDirSpy.mockReturnValue(rrivDir);
    connectSerialSpy.mockReturnValue(serialPortMock as any);

    readSerialUntilQuit(serialPortPath, file, true);
    jest.runAllTimers();

    const mockParserInstance = (
      ReadlineParser as jest.MockedClass<typeof ReadlineParser>
    ).mock.instances[0];
    expect(ReadlineParser).toHaveBeenCalledWith({
      delimiter: "\n",
      includeDelimiter: false,
    });
    expect(fsExistsMock).toHaveBeenCalledTimes(1);
    expect(fsExistsMock).toHaveBeenCalledWith(`${rrivDir}/watch/folder`);
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `Watching output and logging sensor data to ${rrivDir}/watch/${file}\n`
    );
    expect(fsMkdirMock).not.toHaveBeenCalled();
    expect(fsWriteFileMock).not.toHaveBeenCalled();
    expect(connectSerialSpy).toHaveBeenCalledTimes(1);
    expect(connectSerialSpy).toHaveBeenCalledWith(serialPortPath);
    expect(serialPortMock.write).toHaveBeenCalledTimes(2);
    expect(serialPortMock.write).toHaveBeenNthCalledWith(
      1,
      '{"object":"datalogger", "action":"set_mode", "mode":"quiet"}\n'
    );
    expect(serialPortMock.write).toHaveBeenNthCalledWith(
      2,
      '{"object":"datalogger", "action":"set_mode", "mode":"watch-debug"}\n'
    );
    expect(serialPortMock.flush).toHaveBeenCalledTimes(1);
    expect(serialPortMock.flush).toHaveBeenCalledWith();
    expect(serialPortMock.drain).toHaveBeenCalledTimes(1);
    expect(serialPortMock.pipe).toHaveBeenCalledTimes(1);
    expect(serialPortMock.pipe).toHaveBeenCalledWith(mockParserInstance);
    expect(mockParserInstance.on).toHaveBeenCalledTimes(1);
    expect(momentFormatMock).not.toHaveBeenCalled();
  });

  it("directory does not exist and debug is false", () => {
    const serialPortPath = randomUUID();
    const file = `folder/folder/file`;
    const firstDir = randomUUID();
    const secondDir = randomUUID();
    const rrivDir = `${firstDir}/${secondDir}`;

    fsExistsMock.mockReturnValue(false);
    getRRIVDirSpy.mockReturnValue(rrivDir);
    connectSerialSpy.mockReturnValue(serialPortMock as any);

    readSerialUntilQuit(serialPortPath, file, false);
    jest.runAllTimers();

    const mockParserInstance = (
      ReadlineParser as jest.MockedClass<typeof ReadlineParser>
    ).mock.instances[0];
    expect(ReadlineParser).toHaveBeenCalledWith({
      delimiter: "\n",
      includeDelimiter: false,
    });
    expect(fsExistsMock).toHaveBeenCalledTimes(1);
    expect(fsExistsMock).toHaveBeenCalledWith(`${rrivDir}/watch/folder/folder`);
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `Watching output and logging sensor data to ${rrivDir}/watch/${file}\n`
    );
    expect(fsMkdirMock).toHaveBeenCalledTimes(1);
    expect(fsMkdirMock).toHaveBeenCalledWith(`${rrivDir}/watch/folder/folder`, {
      recursive: true,
    });
    expect(connectSerialSpy).toHaveBeenCalledTimes(1);
    expect(connectSerialSpy).toHaveBeenCalledWith(serialPortPath);
    expect(serialPortMock.write).toHaveBeenCalledTimes(2);
    expect(serialPortMock.write).toHaveBeenNthCalledWith(
      1,
      '{"object":"datalogger", "action":"set_mode", "mode":"quiet"}\n'
    );
    expect(serialPortMock.write).toHaveBeenNthCalledWith(
      2,
      '{"object":"datalogger", "action":"set_mode", "mode":"watch"}\n'
    );
    expect(serialPortMock.flush).toHaveBeenCalledTimes(1);
    expect(serialPortMock.flush).toHaveBeenCalledWith();
    expect(serialPortMock.drain).toHaveBeenCalledTimes(1);
    expect(serialPortMock.pipe).toHaveBeenCalledTimes(1);
    expect(serialPortMock.pipe).toHaveBeenCalledWith(mockParserInstance);
    expect(mockParserInstance.on).toHaveBeenCalledTimes(1);
    expect(fsWriteFileMock).not.toHaveBeenCalled();
    expect(momentFormatMock).not.toHaveBeenCalled();
  });

  describe("parserAnonFunction", () => {
    drainFunction.mockImplementation((callback: Function) => {
      callback();
    });
    const serialPortPath = randomUUID();
    const file = `folder/newFolder/file`;
    const firstDir = randomUUID();
    const secondDir = randomUUID();
    const rrivDir = `${firstDir}/${secondDir}`;

    consoleLogSpy.mockImplementation();
    fsExistsMock.mockReturnValue(true);
    getRRIVDirSpy.mockReturnValue(rrivDir);
    connectSerialSpy.mockReturnValue(serialPortMock as any);
    (moment as unknown as jest.Mock).mockImplementation(() => ({
      format: momentFormatMock,
    }));

    readSerialUntilQuit(serialPortPath, file, true);
    jest.runAllTimers();

    const mockParserInstance = (
      ReadlineParser as jest.MockedClass<typeof ReadlineParser>
    ).mock.instances[0];

    const parserAnonFunction = (
      mockParserInstance.on as jest.MockedFunction<typeof mockParserInstance.on>
    ).mock.calls[0][1];

    it("should return undefined", () => {
      const result = parserAnonFunction("{data:1}");

      expect(result).toBeUndefined();
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith("{data:1}");
      expect(fsWriteFileMock).not.toHaveBeenCalled();
      expect(momentFormatMock).not.toHaveBeenCalled();
    });

    it("should write data to file", () => {
      momentFormatMock.mockReturnValue(247000000);
      parserAnonFunction("data");

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith("data");
      expect(momentFormatMock).toHaveBeenCalledTimes(1);
      expect(momentFormatMock).toHaveBeenCalledWith();
      expect(fsWriteFileMock).toHaveBeenCalledTimes(1);
      expect(fsWriteFileMock).toHaveBeenCalledWith(
        `${rrivDir}/watch/folder/newFolder/file`,
        `247000000,data\n`,
        { flag: "a" }
      );
    });
  });
});
