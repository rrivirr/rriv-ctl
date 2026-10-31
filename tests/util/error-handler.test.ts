import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@sentry/node", () => ({
  captureException: vi.fn(),
  flush: vi.fn().mockResolvedValue(undefined),
}));

import { CommanderError } from "commander";
import { errorHandler } from "../../src/util/error-handler.ts";

describe("errorHandler", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let exitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as never);
  });

  it("prints the API error description", async () => {
    await errorHandler({
      error: { response: { data: { error_description: "bad thing" } } },
    });
    expect(logSpy).toHaveBeenCalledWith("ApiError: bad thing");
  });

  it("special-cases the unique-name error", async () => {
    await errorHandler({
      error: {
        response: {
          data: { error_description: "uniquename of device is required" },
        },
      },
    });
    expect(logSpy).toHaveBeenCalledWith("unique name flag is required");
  });

  it("stays quiet for CommanderError and exit", async () => {
    await errorHandler({
      error: new CommanderError(0, "commander.help", "help"),
    });
    await errorHandler({ error: { message: "exit" } });
    expect(logSpy).not.toHaveBeenCalled();
  });

  it("prints validation errors", async () => {
    await errorHandler({ error: { errors: ["one", "two"] } });
    expect(logSpy).toHaveBeenCalledWith("one,two");
  });

  it("explains a missing device path", async () => {
    await errorHandler({ error: new Error("path x is not defined") });
    expect(String(logSpy.mock.calls[0][0])).toContain("device path not found");
  });

  it("prints a generic error", async () => {
    await errorHandler({ error: new Error("boom") });
    expect(logSpy).toHaveBeenCalledWith("\nError", "boom");
  });

  it("returns early when doNothing is set", async () => {
    await errorHandler({ error: new Error("boom"), doNothing: true });
    expect(logSpy).not.toHaveBeenCalled();
  });

  it("exits when requested", async () => {
    await errorHandler({ error: { message: "(outputHelp)" }, exit: true });
    expect(exitSpy).toHaveBeenCalledWith(0);
  });
});
