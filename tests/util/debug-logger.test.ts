import { describe, expect, it, vi } from "vitest";
import db from "../../src/db/db.ts";
import { inDebugMode, logAsDebug } from "../../src/util/debug-logger.ts";

describe("debug-logger", () => {
  it("only logs when debug mode is enabled", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    db.update((data) => {
      data.debugMode = false;
    });
    expect(inDebugMode()).toBe(false);
    logAsDebug("hidden");
    expect(spy).not.toHaveBeenCalled();

    db.update((data) => {
      data.debugMode = true;
    });
    expect(inDebugMode()).toBe(true);
    logAsDebug("shown");
    expect(spy).toHaveBeenCalledWith("shown");
  });
});
