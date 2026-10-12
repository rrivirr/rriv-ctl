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
vi.mock("../../src/infra/wait-for-ready.ts", () => ({
  waitForReady: vi.fn(),
}));
vi.mock("../../src/cli.ts", () => ({ default: { parseAsync: vi.fn() } }));
vi.mock("../../src/util/error-handler.ts", () => ({
  errorHandler: vi.fn(),
}));

import { sendCommands } from "../../src/infra/send-commands.ts";
import { waitForReady } from "../../src/infra/wait-for-ready.ts";
import cli from "../../src/cli.ts";

const lastPort = () => FakeSerialPort.instances.at(-1)!;

const respond = async (payload: unknown) => {
  await vi.advanceTimersByTimeAsync(1500);
  lastPort().parser!.emit("data", JSON.stringify(payload));
};

describe("sendCommands", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    FakeSerialPort.reset();
    vi.useFakeTimers();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("runs a single command and returns the parsed result", async () => {
    const promise = sendCommands(["cmd"], false);
    await respond({ ok: true });
    await expect(promise).resolves.toEqual([{ ok: true }]);
  });

  it("runs multiple commands in order", async () => {
    const promise = sendCommands(["cmd1", "cmd2"], false);
    await respond({ n: 1 });
    await vi.advanceTimersByTimeAsync(0);
    await respond({ n: 2 });
    await expect(promise).resolves.toEqual([{ n: 1 }, { n: 2 }]);
  });

  it("waits for the board after a panic", async () => {
    const promise = sendCommands(["cmd"], false);
    await respond({ error: "panic: crashed" });
    await expect(promise).rejects.toThrow("exit");
    expect(waitForReady).toHaveBeenCalledTimes(1);
  });

  it("re-parses the CLI on datalogger-ready", async () => {
    const promise = sendCommands(["cmd"], false);
    await respond({ error: "datalogger-ready" });
    await expect(promise).rejects.toThrow("exit");
    expect(cli.parseAsync).toHaveBeenCalled();
  });

  it("throws for any other device error", async () => {
    const promise = sendCommands(["cmd"], false);
    await respond({ error: "boom" });
    await expect(promise).rejects.toThrow("Command failed: boom");
  });
});
