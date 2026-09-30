import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FakeSerialPort } from "../helpers/serial.ts";

vi.mock("serialport", async () => {
  const helper = await import("../helpers/serial.ts");
  return {
    SerialPort: helper.FakeSerialPort,
    ReadlineParser: helper.FakeReadlineParser,
  };
});

import { readSerialUntilQuit } from "../../src/infra/read-serial-until-quit.ts";
import { getRRIVDir } from "../../src/util/paths.ts";

describe("readSerialUntilQuit", () => {
  let onSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    FakeSerialPort.reset();
    vi.useFakeTimers();
    vi.spyOn(console, "log").mockImplementation(() => {});
    onSpy = vi.spyOn(process, "on").mockImplementation((() => process) as never);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("logs sensor data and resolves on SIGINT", async () => {
    const promise = readSerialUntilQuit("/dev/tty1", "watch.log", false);

    await vi.advanceTimersByTimeAsync(1000);
    const port = FakeSerialPort.instances.at(-1)!;
    port.parser!.emit("data", '{"json":"line"}'); // skipped (starts with {)
    port.parser!.emit("data", "1,2,3");

    const handler = onSpy.mock.calls.find(
      (call: unknown[]) => call[0] === "SIGINT",
    )?.[1];
    await (handler as () => Promise<void>)();

    await expect(promise).resolves.toBeUndefined();
    expect(port.closed).toBe(true);

    const logPath = path.join(getRRIVDir(), "watch", "watch.log");
    expect(readFileSync(logPath, "utf8")).toContain("1,2,3");
  });

  it("writes the watch-debug command when debug is enabled", async () => {
    readSerialUntilQuit("/dev/tty1", "debug.log", true);
    await vi.advanceTimersByTimeAsync(1000);

    const port = FakeSerialPort.instances.at(-1)!;
    expect(port.written.join("")).toContain("watch-debug");
  });
});
