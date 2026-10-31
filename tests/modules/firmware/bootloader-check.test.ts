import fs from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  /** What each `probe-rs read` call does, in order; `null` fails the call. */
  reads: [] as (Buffer | null)[],
  calls: [] as string[][],
}));

vi.mock("child_process", async () => {
  const { vi: v } = await import("vitest");
  const execFile = v.fn(
    (_cmd: string, args: string[], callback: (error: Error | null) => void) => {
      mocks.calls.push(args);
      const flash = mocks.reads.shift();
      if (!flash) return callback(new Error("probe-rs failed"));
      fs.writeFileSync(args[args.indexOf("--output") + 1]!, flash);
      callback(null);
    },
  );
  return { default: { execFile } };
});

import {
  assertNoBootloader,
  hasBootloader,
} from "../../../src/modules/firmware/util/bootloader-check.ts";

const withBootloader = Buffer.concat([
  Buffer.alloc(1024, 0xff),
  Buffer.from("RRIV Bootloader"),
  Buffer.alloc(1024, 0xff),
]);
const plainApp = Buffer.concat([
  Buffer.alloc(1024, 0x11),
  Buffer.from("RRIV Datalogger"),
]);

beforeEach(() => {
  mocks.reads = [];
  mocks.calls = [];
});

describe("bootloader check", () => {
  it("recognises the bootloader in a flash dump", () => {
    expect(hasBootloader(withBootloader)).toBe(true);
    expect(hasBootloader(plainApp)).toBe(false);
  });

  it("refuses to erase a board with the bootloader", async () => {
    mocks.reads = [withBootloader];
    await expect(assertNoBootloader()).rejects.toThrow(
      /has the RRIV bootloader/,
    );
    expect(mocks.calls[0]).toEqual(
      expect.arrayContaining([
        "read",
        "b8",
        "0x08000000",
        "49152",
        "--format",
        "binary",
      ]),
    );
  });

  it("lets a board without the bootloader through", async () => {
    mocks.reads = [plainApp];
    await expect(assertNoBootloader()).resolves.toBeUndefined();
  });

  it("retries under reset, then gives up rather than erasing blind", async () => {
    mocks.reads = [null, plainApp];
    await expect(assertNoBootloader()).resolves.toBeUndefined();
    expect(mocks.calls[1]).toContain("--connect-under-reset");

    mocks.reads = [null, null];
    await expect(assertNoBootloader()).rejects.toThrow(
      /Couldn't read the board's flash/,
    );
  });

  it("skips the check with force", async () => {
    await expect(assertNoBootloader(true)).resolves.toBeUndefined();
    expect(mocks.calls).toEqual([]);
  });
});
