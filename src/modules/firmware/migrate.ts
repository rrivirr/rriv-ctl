import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { getSerialPathFromCache } from "../../util/get-serial-path-from-cache.ts";
import { getRrivCtlFirmwareDir } from "../../util/paths.ts";
import { spawn } from "../../util/spawn.ts";
import { isReady, readAfterRestart } from "./board-commands.ts";
import {
  type LineSession,
  inBootloader,
  openLineSession,
  parseSignedImage,
  readBootloaderInfo,
} from "./usb-update.ts";
import { bootloaderInstalled } from "./util/bootloader-check.ts";
import { getLatestFirmwareVersion } from "./util/get-latest-firmware-version.ts";
import { probeRsCheck } from "./util/probe-rs-check.ts";

/**
 * `firmware migrate`: move a board from the old layout (firmware at the start
 * of flash, no bootloader) to the RRIV bootloader, with the probe, once. Each
 * signed release carries `rriv-firmware-combined.bin`: its bootloader (built
 * with the release key) padded to 48 KiB, then its signed firmware, written
 * at 0x08000000. Settings, sensors and the serial number are in the external
 * EEPROM, so they stay. Later updates go over USB (`firmware update`).
 */

const BOOTLOADER_SIZE = 48 * 1024;
const COMBINED = "rriv-firmware-combined.bin";
const MANIFEST = "release.json";
const releaseFile = (version: string, name: string) =>
  `https://github.com/rrivirr/rriv-firmware/releases/download/${encodeURIComponent(version)}/${name}`;

export interface CombinedImage {
  bytes: Buffer;
  version: string;
  bootloaderVersion: string | null;
}

/**
 * Check a downloaded combined image against its release.json: size and
 * SHA-256, and a signed image for `version` right after the bootloader.
 */
export const checkCombinedImage = (
  version: string,
  manifest: unknown,
  bytes: Buffer,
): CombinedImage => {
  const m = manifest as {
    version?: unknown;
    bootloader_version?: unknown;
    files?: Record<string, { size?: unknown; sha256?: unknown }>;
  } | null;
  const entry = m?.files?.[COMBINED];
  if (m?.version !== version || !entry) {
    throw new Error(
      `Release ${version} has no combined image (releases from before the bootloader don't).`,
    );
  }
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  if (bytes.length !== entry.size || sha256 !== entry.sha256) {
    throw new Error(
      `The ${version} combined image doesn't match its release.json.`,
    );
  }
  if (bytes.length <= BOOTLOADER_SIZE) {
    throw new Error(
      `The ${version} combined image is too small to hold the bootloader.`,
    );
  }
  const firmware = parseSignedImage(bytes.subarray(BOOTLOADER_SIZE));
  if (firmware.version !== version) {
    throw new Error(
      `The ${version} combined image holds firmware ${firmware.version}.`,
    );
  }
  return {
    bytes,
    version,
    bootloaderVersion:
      typeof m.bootloader_version === "string" ? m.bootloader_version : null,
  };
};

const download = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Couldn't download ${url} (HTTP ${response.status}).`);
  }
  return Buffer.from(await response.arrayBuffer());
};

/** What `migrateFirmware` uses; replaced in tests. */
export interface MigrateDeps {
  checkProbe: () => Promise<void>;
  hasBootloader: () => Promise<boolean>;
  latestVersion: () => Promise<string>;
  download: (url: string) => Promise<Buffer>;
  /** Write `file` at the start of flash (whole-chip erase) and reset. */
  flashAtStart: (file: string) => Promise<void>;
  /** Wait for the firmware's ready line; false if it doesn't come. */
  waitForBoard: () => Promise<boolean>;
  /** The board's serial port. */
  openSession: () => Promise<LineSession>;
  cacheDir: () => string;
}

const defaultDeps: MigrateDeps = {
  checkProbe: probeRsCheck,
  hasBootloader: bootloaderInstalled,
  latestVersion: () => getLatestFirmwareVersion(),
  download,
  flashAtStart: async (file) => {
    const probe = ["--chip", "STM32F103RE", "--protocol", "swd"];
    await spawn("probe-rs", [
      "download",
      file,
      "--binary-format",
      "bin",
      "--base-address",
      "0x08000000",
      ...probe,
      "--allow-erase-all",
      "--chip-erase",
    ]);
    await spawn("probe-rs", ["reset", ...probe]);
  },
  // The first boot write-protects the bootloader (one extra reset) and checks
  // the firmware's signature before starting it.
  waitForBoard: () =>
    readAfterRestart(getSerialPathFromCache(), isReady, 60_000).then(
      () => true,
      () => false,
    ),
  openSession: () => openLineSession(getSerialPathFromCache()),
  cacheDir: getRrivCtlFirmwareDir,
};

/**
 * Flash a release's combined image on a board without the bootloader.
 * Resolves with the release migrated to.
 */
export const migrateFirmware = async (
  options: { version?: string; log?: (message: string) => void } = {},
  deps: MigrateDeps = defaultDeps,
): Promise<CombinedImage> => {
  const log = options.log ?? (() => undefined);
  await deps.checkProbe();
  if (await deps.hasBootloader()) {
    throw new Error(
      "This board already has the RRIV bootloader. Update its firmware over USB with `rrivctl firmware update`.",
    );
  }

  const version = options.version ?? (await deps.latestVersion());
  log(`downloading ${version}...`);
  const manifestBytes = await deps
    .download(releaseFile(version, MANIFEST))
    .catch(() => {
      throw new Error(
        `Release ${version} has no release.json (releases from before the bootloader don't).`,
      );
    });
  let manifest: unknown;
  try {
    manifest = JSON.parse(manifestBytes.toString("utf8"));
  } catch {
    throw new Error(`Release ${version}'s release.json isn't valid JSON.`);
  }
  const combined = checkCombinedImage(
    version,
    manifest,
    await deps.download(releaseFile(version, COMBINED)),
  );

  const file = path.join(
    deps.cacheDir(),
    `rriv-firmware-combined-${version}.bin`,
  );
  fs.writeFileSync(file, combined.bytes);
  log(
    `flashing bootloader ${combined.bootloaderVersion ?? "(unknown version)"} and firmware ${version} with the probe (whole-chip erase; settings in the EEPROM stay)...`,
  );
  await deps.flashAtStart(file);
  log(
    "waiting for the board to start (the first boot takes a few seconds longer)...",
  );
  if (!(await deps.waitForBoard())) await startHeldBackFirmware(deps, log);
  return combined;
};

/**
 * The new bootloader can wait in update mode instead of starting the firmware
 * when RAM still holds a start-up log with unfinished start-ups (probe resets
 * during the old firmware's start-up count as such, and the log survives the
 * flash). That record is about the firmware that was replaced, so start the
 * new one once (`boot` overrides the loop guard for one start-up).
 */
export const startHeldBackFirmware = async (
  deps: MigrateDeps,
  log: (message: string) => void,
) => {
  const session = await deps.openSession();
  try {
    if (!(await inBootloader(session))) {
      throw new Error("The board didn't report ready after the migration.");
    }
    const info = await readBootloaderInfo(session);
    if (!info.appValid) {
      throw new Error(
        `The bootloader refused the new firmware (${info.appError ?? "unknown reason"}).`,
      );
    }
    log(
      info.startupLoop
        ? `the bootloader held the firmware back (a start-up loop recorded before the migration, at ${info.startupLoop.stoppedAt}); starting it...`
        : "the board is in update mode; starting the firmware...",
    );
    await session.send({ object: "bootloader", action: "boot" });
  } finally {
    await session.close();
  }
  if (!(await deps.waitForBoard())) {
    throw new Error(
      "The board didn't report ready after starting the new firmware.",
    );
  }
};
