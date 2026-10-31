import { EventEmitter } from "node:events";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  children: [] as (EventEmitter & { kill: ReturnType<typeof vi.fn> })[],
}));

vi.mock("child_process", async () => {
  const { vi: v } = await import("vitest");
  const spawn = v.fn(() => {
    const child = new EventEmitter() as EventEmitter & {
      kill: ReturnType<typeof vi.fn>;
    };
    child.kill = v.fn();
    mocks.children.push(child);
    return child;
  });
  return { default: { spawn } };
});

import { spawn } from "../../src/util/spawn.ts";

const childResult = async (
  exitCode: number | null,
): Promise<EventEmitter & { kill: ReturnType<typeof vi.fn> }> => {
  const child = mocks.children.at(-1)!;
  child.emit("close", exitCode, null);
  return child;
};

describe("spawn", () => {
  let onSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mocks.children.length = 0;
    onSpy = vi
      .spyOn(process, "on")
      .mockImplementation((() => process) as never);
  });

  it("resolves on a zero exit code", async () => {
    const promise = spawn("bash", ["x"]);
    await childResult(0);
    await expect(promise).resolves.toBeUndefined();
    expect(onSpy).toHaveBeenCalledWith("SIGINT", expect.any(Function));
  });

  it("rejects on a non-zero exit code", async () => {
    const promise = spawn("bash", ["x"]);
    await childResult(1);
    await expect(promise).rejects.toEqual({ message: "exit" });
  });

  it("resolves when the cleanup callback reports success", async () => {
    const cleanup = vi.fn().mockResolvedValue(true);
    const promise = spawn("bash", ["x"], cleanup);
    await childResult(1);
    await expect(promise).resolves.toBeUndefined();
    expect(cleanup).toHaveBeenCalled();
  });

  it("kills the child on SIGINT", () => {
    spawn("bash", ["x"]);
    const handler = onSpy.mock.calls.find(
      (call: unknown[]) => call[0] === "SIGINT",
    )?.[1];
    (handler as () => void)();
    expect(mocks.children.at(-1)!.kill).toHaveBeenCalled();
  });

  it("rejects when the child emits an error", async () => {
    const promise = spawn("bash", ["x"]);
    mocks.children.at(-1)!.emit("error", new Error("nope"));
    await expect(promise).rejects.toThrow("nope");
  });
});
