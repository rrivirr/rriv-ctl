import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  /** What the board prints for each command it receives. */
  lines: [] as string[][],
  written: [] as string[],
}));

// A port that prints the next scripted lines whenever a command is written.
vi.mock("serialport", () => {
  class SerialPort {
    isOpen = true;
    private emit: (line: string) => void = () => undefined;
    open(callback: (error: Error | null) => void) {
      callback(null);
    }
    pipe() {
      return {
        on: (_event: string, handler: (line: string) => void) => {
          this.emit = handler;
        },
      };
    }
    write(data: string) {
      mocks.written.push(data);
      const lines = mocks.lines.shift() ?? [];
      setTimeout(() => lines.forEach((line) => this.emit(line)), 0);
    }
    close(callback?: () => void) {
      this.isOpen = false;
      callback?.();
    }
  }
  return { SerialPort, ReadlineParser: function ReadlineParser() {} };
});

import {
  BoardError,
  openLineSession,
} from "../../../src/modules/firmware/usb-update.ts";

describe("openLineSession", () => {
  it("skips the echo, trace lines, the ready status and other output", async () => {
    mocks.lines = [
      [
        '{"object":"board","action":"get","subcommand":"startup"}',
        "starting up",
        '{"startup":"usb"}',
        '{"startup":"usb","done":true}',
        '{"status":"datalogger-ready"}',
        '{"startup":{"failed_startups":3,"stopped_at":"indicators"}}\r',
      ],
    ];
    const session = await openLineSession("/dev/test");

    // `board get startup`'s reply also has a `startup` field, but an object.
    await expect(
      session.send({ object: "board", action: "get", subcommand: "startup" }),
    ).resolves.toEqual({
      startup: { failed_startups: 3, stopped_at: "indicators" },
    });
    expect(mocks.written).toEqual([
      '{"object":"board","action":"get","subcommand":"startup"}\n',
    ]);
    await session.close();
  });

  it("rejects with the board's error", async () => {
    mocks.lines = [
      ['{"status":"error","message":"image refused","error":"bad_signature"}'],
    ];
    const session = await openLineSession("/dev/test");

    const sent = session.send({ object: "bootloader", action: "write" });
    await expect(sent).rejects.toBeInstanceOf(BoardError);
    await expect(sent).rejects.toMatchObject({
      reply: { error: "bad_signature" },
    });
    await session.close();
  });

  it("times out when only non-replies come", async () => {
    mocks.lines = [['{"startup":"usb"}', '{"status":"datalogger-ready"}']];
    const session = await openLineSession("/dev/test");

    await expect(
      session.send({ object: "bootloader", action: "info" }, 50),
    ).rejects.toThrow(/Timed out/);
    await session.close();
  });
});
