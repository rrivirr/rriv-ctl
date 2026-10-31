import ChildProcess from "child_process";
import fs from "node:fs";
import path from "node:path";
import util from "util";
import { getRrivCtlFirmwareDir } from "../../../util/paths.ts";

/** The bootloader's USB product name, stored in its first 48 KiB of flash. */
const BOOTLOADER_MARKER = "RRIV Bootloader";
const BOOTLOADER_SIZE = 48 * 1024;

export const hasBootloader = (flash: Buffer) =>
  flash.includes(BOOTLOADER_MARKER);

const readBootloaderArea = async (
  connectUnderReset: boolean,
): Promise<Buffer> => {
  const exec = util.promisify(ChildProcess.execFile);
  const output = path.join(getRrivCtlFirmwareDir(), "bootloader-check.bin");
  try {
    await exec("probe-rs", [
      "read",
      "b8",
      "0x08000000",
      String(BOOTLOADER_SIZE),
      "--chip",
      "STM32F103RE",
      "--protocol",
      "swd",
      ...(connectUnderReset ? ["--connect-under-reset"] : []),
      "--output",
      output,
      "--format",
      "binary",
    ]);
    return fs.readFileSync(output);
  } finally {
    fs.rmSync(output, { force: true });
  }
};

/** Read the board's flash with the probe: is the RRIV bootloader installed? */
export const bootloaderInstalled = async () => {
  let flash: Buffer;
  try {
    flash = await readBootloaderArea(false).catch(() =>
      readBootloaderArea(true),
    );
  } catch {
    throw new Error(
      "Couldn't read the board's flash to check for the RRIV bootloader. Check the probe connection, or rerun with --force to flash anyway.",
    );
  }
  return hasBootloader(flash);
};

/**
 * Every flash script erases the whole chip, which would remove the RRIV
 * bootloader. Refuse unless `force` is set.
 */
export const assertNoBootloader = async (force = false) => {
  if (force) return;
  if (await bootloaderInstalled()) {
    throw new Error(
      "This board has the RRIV bootloader. Flashing erases the whole chip and would remove it (see board/bootloader/README.md in rriv-firmware). Rerun with --force to flash anyway.",
    );
  }
};
