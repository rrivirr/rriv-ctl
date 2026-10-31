import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  type MigrateDeps,
  checkCombinedImage,
  migrateFirmware,
} from "../../../src/modules/firmware/migrate.ts";
import {
  BoardError,
  type LineSession,
} from "../../../src/modules/firmware/usb-update.ts";

const BOOTLOADER_SIZE = 48 * 1024;

/** Bootloader padded to 48 KiB, then a signed image for `version`. */
const combinedImage = (version: string, appSize = 700) => {
  const signed = Buffer.alloc(512 + appSize, 0x5a);
  signed.write("RRIV", 0, "latin1");
  signed.writeUInt16LE(1, 4);
  signed.writeUInt16LE(512, 6);
  signed.writeUInt32LE(appSize, 8);
  signed.writeUInt32LE(0, 12);
  signed.fill(0, 16, 48);
  signed.write(version, 16, "latin1");
  return Buffer.concat([Buffer.alloc(BOOTLOADER_SIZE, 0xff), signed]);
};

const manifestFor = (version: string, combined: Buffer) => ({
  version,
  bootloader_version: "1.0.0",
  min_bootloader: "1.0.0",
  files: {
    "rriv-firmware-combined.bin": {
      size: combined.length,
      sha256: createHash("sha256").update(combined).digest("hex"),
    },
  },
});

const fakeDeps = (options: {
  bootloader?: boolean;
  files: Record<string, Buffer | string>;
  /** After the flash: the bootloader holds the firmware back (start-up loop). */
  heldBack?: boolean;
}) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rrivctl-migrate-"));
  const calls = {
    flashed: [] as Buffer[],
    waited: 0,
    downloads: [] as string[],
    sent: [] as Record<string, unknown>[],
  };
  let held = options.heldBack ?? false;
  // The board after the flash: the bootloader while it holds the firmware
  // back, otherwise the firmware.
  const session: LineSession = {
    send: async (command) => {
      calls.sent.push(command);
      if (!held) return { message: '{"fv":"v2.0.0"}' };
      if (command.object !== "bootloader") {
        throw new BoardError({
          status: "error",
          message: "in bootloader mode",
          error: "unsupported command",
        });
      }
      if (command.action === "boot") {
        held = false;
        return { message: "booting" };
      }
      return {
        bootloader: "rriv",
        version: "1.0.0",
        app_valid: true,
        app_version: "v2.0.0",
        startup_loop: { stopped_at: "indicators", unfinished: 3 },
      };
    },
    close: async () => undefined,
  };
  const deps: MigrateDeps = {
    checkProbe: async () => undefined,
    hasBootloader: async () => options.bootloader ?? false,
    latestVersion: async () => "v2.0.0",
    download: async (url) => {
      calls.downloads.push(url);
      const name = url.split("/").pop()!;
      const content = options.files[name];
      if (content === undefined) throw new Error("HTTP 404");
      return Buffer.from(content);
    },
    flashAtStart: async (file) => {
      calls.flashed.push(fs.readFileSync(file));
    },
    waitForBoard: async () => {
      calls.waited += 1;
      return !held;
    },
    openSession: async () => session,
    cacheDir: () => dir,
  };
  return { deps, calls };
};

describe("checkCombinedImage", () => {
  it("accepts a combined image matching its release.json", () => {
    const combined = combinedImage("v2.0.0");
    expect(
      checkCombinedImage("v2.0.0", manifestFor("v2.0.0", combined), combined),
    ).toMatchObject({ version: "v2.0.0", bootloaderVersion: "1.0.0" });
  });

  it("refuses a mismatched or mislabelled image", () => {
    const combined = combinedImage("v2.0.0");
    const other = combinedImage("v1.9.0");
    expect(() =>
      checkCombinedImage("v2.0.0", manifestFor("v2.0.0", combined), other),
    ).toThrow(/doesn't match its release\.json/);
    expect(() =>
      checkCombinedImage(
        "v2.0.0",
        { ...manifestFor("v2.0.0", other), version: "v2.0.0" },
        other,
      ),
    ).toThrow(/holds firmware v1\.9\.0/);
    expect(() =>
      checkCombinedImage("v2.0.0", { version: "v2.0.0", files: {} }, combined),
    ).toThrow(/has no combined image/);
  });
});

describe("migrateFirmware", () => {
  it("flashes the latest release's combined image and waits for the board", async () => {
    const combined = combinedImage("v2.0.0");
    const { deps, calls } = fakeDeps({
      files: {
        "release.json": JSON.stringify(manifestFor("v2.0.0", combined)),
        "rriv-firmware-combined.bin": combined,
      },
    });

    const migrated = await migrateFirmware({}, deps);

    expect(migrated.version).toBe("v2.0.0");
    expect(calls.downloads).toEqual([
      "https://github.com/rrivirr/rriv-firmware/releases/download/v2.0.0/release.json",
      "https://github.com/rrivirr/rriv-firmware/releases/download/v2.0.0/rriv-firmware-combined.bin",
    ]);
    expect(calls.flashed).toEqual([combined]);
    expect(calls.waited).toBe(1);
  });

  it("starts the firmware when the new bootloader holds it back for a loop recorded before", async () => {
    const combined = combinedImage("v2.0.0");
    const { deps, calls } = fakeDeps({
      heldBack: true,
      files: {
        "release.json": JSON.stringify(manifestFor("v2.0.0", combined)),
        "rriv-firmware-combined.bin": combined,
      },
    });
    const logged: string[] = [];

    await migrateFirmware({ log: (m) => logged.push(m) }, deps);

    expect(calls.sent.at(-1)).toEqual({ object: "bootloader", action: "boot" });
    expect(calls.waited).toBe(2);
    expect(logged.join("\n")).toMatch(
      /held the firmware back .* at indicators/,
    );
  });

  it("refuses a board that already has the bootloader", async () => {
    const { deps, calls } = fakeDeps({ bootloader: true, files: {} });
    await expect(migrateFirmware({}, deps)).rejects.toThrow(
      /already has the RRIV bootloader/,
    );
    expect(calls.downloads).toEqual([]);
    expect(calls.flashed).toEqual([]);
  });

  it("refuses a release from before the bootloader, flashing nothing", async () => {
    const { deps, calls } = fakeDeps({ files: { "rriv-firmware.elf": "elf" } });
    await expect(migrateFirmware({ version: "v1.15.0" }, deps)).rejects.toThrow(
      /Release v1\.15\.0 has no release\.json/,
    );
    expect(calls.flashed).toEqual([]);
  });
});
