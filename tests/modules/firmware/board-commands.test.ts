import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  replies: [] as Record<string, unknown>[],
  sent: [] as string[],
  clearEeprom: vi.fn(),
  flashFirmware: vi.fn(),
}));

vi.mock("../../../src/infra/send-commands.ts", () => ({
  sendSingleCommand: vi.fn(async (command: string) => {
    mocks.sent.push(command.trim());
    return mocks.replies.shift() ?? {};
  }),
}));
vi.mock("../../../src/util/get-serial-path-from-cache.ts", () => ({
  getSerialPathFromCache: () => "/dev/test",
}));
vi.mock("../../../src/modules/firmware/flash.ts", () => ({
  clearEeprom: mocks.clearEeprom,
  flashFirmware: mocks.flashFirmware,
}));
// The board restarting: no real port to reopen in tests.
vi.mock("serialport", () => {
  class SerialPort {
    private handlers: Record<string, (line?: string) => void> = {};
    open(callback: (error: Error | null) => void) {
      callback(null);
    }
    pipe() {
      return {
        on: (_event: string, handler: (line: string) => void) =>
          setTimeout(() => handler('{"status":"datalogger-ready"}'), 0),
      };
    }
    on(event: string, handler: () => void) {
      this.handlers[event] = handler;
    }
    close(callback?: () => void) {
      callback?.();
    }
  }
  return { SerialPort, ReadlineParser: function ReadlineParser() {} };
});

import {
  describeStartupReport,
  parseStartupReport,
  parseTraceLine,
} from "../../../src/modules/firmware/board-commands.ts";
import { firmwareResetAction } from "../../../src/commands/firmware/action.ts";

const report = {
  startup: {
    previous_completed: false,
    stopped_at: "i2c2",
    failed_startups: 2,
    reset_cause: "watchdog",
    traced: false,
  },
};

beforeEach(() => {
  mocks.replies.length = 0;
  mocks.sent.length = 0;
  mocks.clearEeprom.mockReset();
  mocks.flashFirmware.mockReset();
});

describe("board command replies", () => {
  it("reads the start-up report, and null from older firmware", () => {
    expect(parseStartupReport(report)).toEqual({
      previousCompleted: false,
      stoppedAt: "i2c2",
      failedStartups: 2,
      resetCause: "watchdog",
      traced: false,
    });
    expect(
      parseStartupReport({ message: "Unsupported param in command" }),
    ).toBeNull();
  });

  it("reads trace lines and nothing else", () => {
    expect(parseTraceLine('{"startup":"usb"}')).toEqual({
      step: "usb",
      done: false,
    });
    expect(parseTraceLine('{"startup":"usb","done":true}')).toEqual({
      step: "usb",
      done: true,
    });
    expect(parseTraceLine('{"status":"datalogger-ready"}')).toBeNull();
    expect(parseTraceLine("not json")).toBeNull();
  });

  it("describes an unfinished start-up", () => {
    expect(describeStartupReport(parseStartupReport(report)!)).toBe(
      [
        "previous start-up: didn't finish",
        "last reset: watchdog",
        "stopped at: i2c2",
        "unfinished start-ups in a row before this one: 2",
      ].join("\n"),
    );
  });
});

describe("firmware reset", () => {
  it("uses the firmware's own reset when it has a start-up log", async () => {
    mocks.replies.push(report, { message: "datalogger reset, restarting" });
    await firmwareResetAction({});
    expect(mocks.sent).toEqual([
      '{"object":"board","action":"get","parameter":"startup"}',
      '{"object":"datalogger","action":"reset"}',
    ]);
    expect(mocks.clearEeprom).not.toHaveBeenCalled();
    expect(mocks.flashFirmware).not.toHaveBeenCalled();
  });

  it("flashes the clear-EEPROM firmware on older firmware, never sending the reset", async () => {
    mocks.replies.push({ message: "Unsupported param in command" });
    await firmwareResetAction({});
    expect(mocks.sent).toEqual([
      '{"object":"board","action":"get","parameter":"startup"}',
    ]);
    expect(mocks.clearEeprom).toHaveBeenCalledWith("config", undefined);
    expect(mocks.flashFirmware).toHaveBeenCalled();
  });
});
