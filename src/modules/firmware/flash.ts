import { probeRsCheck } from "./util/probe-rs-check.ts";
import { getRrivCtlFirmwareDir } from "../../util/paths.ts";
import { spawn } from "../../util/spawn.ts";
import { waitForReady } from "../../infra/wait-for-ready.ts";
import { errorHandler } from "../../util/error-handler.ts";
import { loadScript } from "../../util/load-script.ts";
import { getLatestFirmwareVersion } from "./util/get-latest-firmware-version.ts";
import { uploadFirmwareEntry } from "./util/upload-firmware-entry.ts";
import { yellowBright } from "yoctocolors";

export const clearEeprom = async (type: "complete" | "config") => {
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
) => {
  await probeRsCheck();
  const dirPath = getRrivCtlFirmwareDir();

  if (initialFirmware) {
    await clearEeprom("complete");
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

export const flashFirmware = async (firmwareVersion?: string) => {
  let versionToFlash = firmwareVersion;

  if (!versionToFlash) {
    versionToFlash = await getLatestFirmwareVersion();
  }

  await flash(versionToFlash, "flash-firmware");
  await uploadFirmwareEntry(versionToFlash);
};

export const flashInitialFirmware = async (
  boardVersion: string,
  customVersion?: string,
) => {
  let versionToFlash = customVersion;

  if (!versionToFlash) {
    versionToFlash = await getLatestFirmwareVersion();
  }

  if (boardVersion !== versionToFlash) {
    await flash(versionToFlash, "flash-initial-firmware", true);
  }
};
