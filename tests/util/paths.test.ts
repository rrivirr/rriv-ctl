import { existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  defaultSerialFile,
  getRrivCtlDir,
  getRrivCtlFirmwareDir,
  getRrivCtlScriptsDir,
  getRRIVDir,
} from "../../src/util/paths.ts";

describe("paths", () => {
  it("roots everything under ~/.rriv", () => {
    expect(getRRIVDir()).toBe(path.join(homedir(), ".rriv"));
    expect(getRrivCtlDir()).toBe(path.join(getRRIVDir(), ".rrivctl"));
    expect(defaultSerialFile()).toBe(
      path.join(getRrivCtlDir(), "default_serial"),
    );
  });

  it("creates the firmware and scripts directories on demand", () => {
    expect(existsSync(getRrivCtlFirmwareDir())).toBe(true);
    expect(existsSync(getRrivCtlScriptsDir())).toBe(true);
  });
});
