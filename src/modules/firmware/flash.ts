import {
  assertNoBootloader,
  bootloaderInstalled,
} from "./util/bootloader-check.ts";
import { readStartupReport, resetDatalogger } from "./board-commands.ts";
import { probeRsCheck } from "./util/probe-rs-check.ts";
import { getRrivCtlFirmwareDir } from "../../util/paths.ts";
import { spawn } from "../../util/spawn.ts";
import { waitForReady } from "../../infra/wait-for-ready.ts";
import { errorHandler } from "../../util/error-handler.ts";
import { loadScript } from "../../util/load-script.ts";
import { getLatestFirmwareVersion } from "./util/get-latest-firmware-version.ts";
import { uploadFirmwareEntry } from "./util/upload-firmware-entry.ts";
import { yellowBright } from "yoctocolors";

export const clearEeprom = async (
  type: "complete" | "config",
  force = false,
) => {
  await probeRsCheck();
  await assertNoBootloader(force);
  const rrivScriptsVersion = await getLatestFirmwareVersion(true);
  const dirPath = getRrivCtlFirmwareDir();

  console.log("clearing eeprom");
  const fileName = "clear-eeprom.sh";

  const newFilePath = await loadScript(
    `../src/modules/firmware/scripts/${fileName}`,
    fileName,
  );

  const clearEepromTypeFirmware =
    type === "complete"
      ? "clear-eeprom-complete"
      : "clear-eeprom-configurations";

  try {
    await spawn("bash", [
      newFilePath,
      dirPath,
      rrivScriptsVersion,
      clearEepromTypeFirmware,
    ]);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    console.log("eeprom cleared...");
  } catch (error) {
    await errorHandler({ error, exit: true });
  }
};

const initialFirmwareRetry = async (
  dirPath: string,
  firmwareVersion: string,
) => {
  const newFilePath = await loadScript(
    "../src/modules/firmware/scripts/flash-firmware.sh",
    `flash-firmware.sh`,
  );
  try {
    console.log(`\n${yellowBright("RETRYING...")}\n`);
    await spawn("bash", [newFilePath, dirPath, firmwareVersion]);
    return true;
  } catch (error) {
    await errorHandler({ error, exit: true });
  }
};

const flash = async (
  firmwareVersion: string,
  fileName: string,
  initialFirmware?: boolean,
  force = false,
) => {
  await probeRsCheck();
  await assertNoBootloader(force);
  const dirPath = getRrivCtlFirmwareDir();

  if (initialFirmware) {
    // Already checked above.
    await clearEeprom("complete", true);
  }

  console.log("flashing", firmwareVersion, "to device");

  const script = `../src/modules/firmware/scripts/${fileName}.sh`;
  const newFilePath = await loadScript(script, `${fileName}.sh`);

  await spawn(
    "bash",
    [newFilePath, dirPath, firmwareVersion],
    initialFirmware
      ? () => initialFirmwareRetry(dirPath, firmwareVersion)
      : undefined,
  );

  await waitForReady();
  console.log("device successfully flashed...");
};

export const flashFirmware = async (
  firmwareVersion?: string,
  force = false,
) => {
  let versionToFlash = firmwareVersion;

  if (!versionToFlash) {
    versionToFlash = await getLatestFirmwareVersion();
  }

  await flash(versionToFlash, "flash-firmware", false, force);
  await uploadFirmwareEntry(versionToFlash);
};

export const flashInitialFirmware = async (
  boardVersion: string,
  customVersion?: string,
  force = false,
  serialPortPath?: string,
) => {
  let versionToFlash = customVersion;

  if (!versionToFlash) {
    versionToFlash = await getLatestFirmwareVersion();
  }

  if (boardVersion === versionToFlash) return;

  if (!force && (await bootloaderInstalled())) {
    // The probe flashes would erase the bootloader. Clear the EEPROM with the
    // firmware's own command instead, and leave the firmware to a USB install.
    if (serialPortPath && (await readStartupReport(serialPortPath))) {
      await resetDatalogger(serialPortPath);
      console.log(
        "datalogger settings reset to their defaults and sensors removed",
      );
    }
    console.log(
      `This board has the RRIV bootloader, so ${versionToFlash} isn't flashed with the probe. Install it from the web app's Firmware tab.`,
    );
    return;
  }

  await flash(versionToFlash, "flash-initial-firmware", true, force);
};
