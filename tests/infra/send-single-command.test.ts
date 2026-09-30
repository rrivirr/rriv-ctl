import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FakeSerialPort } from "../helpers/serial.ts";

vi.mock("serialport", async () => {
  const helper = await import("../helpers/serial.ts");
  return {
    SerialPort: helper.FakeSerialPort,
    ReadlineParser: helper.FakeReadlineParser,
  };
});

// Avoid loading the whole command registry just for the datalogger-ready branch.
vi.mock("../../src/cli.ts", () => ({ default: { parseAsync: vi.fn() } }));

import { sendSingleCommand } from "../../src/infra/send-commands.ts";

const lastPort = () => {
  const port = FakeSerialPort.instances.at(-1);
  if (!port) throw new Error("no serial port was opened");
  return port;
};

describe("sendSingleCommand", () => {
  beforeEach(() => {
    FakeSerialPort.reset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("writes the command and resolves with the parsed response", async () => {
    const promise = sendSingleCommand('{"object":"datalogger"}\n', false, "/dev/tty");
    await vi.advanceTimersByTimeAsync(1500);

    const port = lastPort();
    expect(port.written).toEqual(['{"object":"datalogger"}\n']);

    port.parser!.emit("data", JSON.stringify({ success: true, value: 42 }));
    await expect(promise).resolves.toEqual({ success: true, value: 42 });
    expect(port.closed).toBe(true);
  });

  it("surfaces an error field from the response", async () => {
    const promise = sendSingleCommand("cmd\n", false, "/dev/tty");
    await vi.advanceTimersByTimeAsync(1500);
    lastPort().parser!.emit("data", JSON.stringify({ error: "boom" }));
    await expect(promise).resolves.toEqual({ error: "boom" });
  });

  it("surfaces datalogger-ready as an error sentinel", async () => {
    const promise = sendSingleCommand("cmd\n", false, "/dev/tty");
    await vi.advanceTimersByTimeAsync(1500);
    lastPort().parser!.emit(
      "data",
      JSON.stringify({ status: "datalogger-ready" }),
    );
    await expect(promise).resolves.toEqual({ error: "datalogger-ready" });
  });

  it("ignores the echoed command line", async () => {
    const promise = sendSingleCommand("cmd\n", false, "/dev/tty");
    await vi.advanceTimersByTimeAsync(1500);

    const port = lastPort();
    port.parser!.emit("data", '{"object":"datalogger","action":"set"}');
    port.parser!.emit("data", JSON.stringify({ ok: true }));
    await expect(promise).resolves.toEqual({ ok: true });
  });

  it("rejects when the device never responds", async () => {
    const promise = sendSingleCommand("cmd\n", false, "/dev/tty");
    // Attach the rejection handler before the timer fires.
    const assertion = expect(promise).rejects.toBe(
      "Timed out talking to the datalogger. Ensure it is plugged in.",
    );
    await vi.advanceTimersByTimeAsync(5000);
    await assertion;
  });
});
