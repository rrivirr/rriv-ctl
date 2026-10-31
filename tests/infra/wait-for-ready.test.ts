import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FakeSerialPort } from "../helpers/serial.ts";

vi.mock("serialport", async () => {
  const helper = await import("../helpers/serial.ts");
  return {
    SerialPort: helper.FakeSerialPort,
    ReadlineParser: helper.FakeReadlineParser,
  };
});

vi.mock("../../src/util/get-serial-path-from-cache.ts", () => ({
  getSerialPathFromCache: () => "/dev/ttyTEST",
}));

import { waitForReady } from "../../src/infra/wait-for-ready.ts";

describe("waitForReady", () => {
  beforeEach(() => {
    FakeSerialPort.reset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves once the device reports datalogger-ready", async () => {
    const promise = waitForReady();
    await vi.advanceTimersByTimeAsync(7000); // initial settle delay
    await vi.advanceTimersByTimeAsync(1500); // flush -> pipe

    const port = FakeSerialPort.instances.at(-1);
    if (!port) throw new Error("no serial port was opened");
    port.parser!.emit("data", "datalogger-ready");

    await expect(promise).resolves.toBeUndefined();
    expect(port.closed).toBe(true);
  });

  it("rejects after the ready timeout", async () => {
    const promise = waitForReady();
    const assertion = expect(promise).rejects.toBe(
      "Timed out waiting for datalogger-ready status",
    );
    await vi.advanceTimersByTimeAsync(7000);
    await vi.advanceTimersByTimeAsync(1500);
    await vi.advanceTimersByTimeAsync(13_000);

    await assertion;
  });
});
