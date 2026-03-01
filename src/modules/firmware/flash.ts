import { probeRsCheck } from "./util/probe-rs-check.ts";
import { getRrivCtlDir } from "../../util/paths.ts";
import { spawn } from "../../util/spawn.ts";
import { waitForReady } from "../../infra/wait-for-ready.ts";
import { errorHandler } from "../../util/error-handler.ts";
import { loadScript } from "../../util/load-script.ts";
import { getLatestFirmwareVersion } from "./util/get-latest-firmware-version.ts";
import { uploadFirmwareEntry } from "./util/upload-firmware-entry.ts";
import { existsSync } from "node:fs";

export const clearEeprom = async (dirPath: string = getRrivCtlDir()) => {
  const rrivScriptsVersion = await getLatestFirmwareVersion(true);

  console.log("clearing eeprom");
  const fileName = "clear-eeprom.sh";
  const cleanup = async () => {
    await spawn("rm", [fileName]);
  };
  await loadScript(`../src/modules/firmware/scripts/${fileName}`, fileName);

  try {
    await spawn("bash", [fileName, dirPath, rrivScriptsVersion], cleanup);
    await cleanup();
    await new Promise((resolve) => setTimeout(resolve, 5000));
    console.log("eeprom cleared...");
  } catch (error) {
    errorHandler({ error, exit: true });
  }
};

const initialFirmwareRetry = async (
  dirPath: string,
  firmwareVersion: string,
) => {
  const cleanup = async () => {
    await spawn("rm", [`flash-initial-firmware.sh`]);
    await spawn("rm", [`flash-firmware.sh`]);
  };
  await loadScript(
    "../src/modules/firmware/scripts/flash-firmware.sh",
    `flash-firmware.sh`,
  );
  try {
    console.log("\nretrying...");
    await spawn(
      "bash",
      [`flash-firmware.sh`, dirPath, firmwareVersion],
      cleanup,
    );
    await cleanup();
    return true;
  } catch (error) {
    errorHandler({ error, exit: true });
  }
};

const flash = async (
  firmwareVersion: string,
  fileName: string,
  initialFirmware?: boolean,
) => {
  await probeRsCheck();
  const dirPath = getRrivCtlDir();

  if (initialFirmware) {
    await clearEeprom(dirPath);
  }

  console.log("flashing", firmwareVersion, "to device");

  const script = `../src/modules/firmware/scripts/${fileName}.sh`;
  await loadScript(script, `${fileName}.sh`);
  const cleanup = async () => {
    const fileExists = existsSync(`${fileName}.sh`);
    if (fileExists) {
      await spawn("rm", [`${fileName}.sh`]);
    }
  };

  await spawn(
    "bash",
    [`${fileName}.sh`, dirPath, firmwareVersion],
    initialFirmware
      ? () => initialFirmwareRetry(dirPath, firmwareVersion)
      : cleanup,
  );
  await cleanup();

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
