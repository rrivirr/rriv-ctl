import { randomUUID } from "crypto";
import { probeRsCheck } from "./util/probe-rs-check.ts";
import { getRrivCtlDir } from "../../util/paths.ts";
import { spawn } from "../../util/spawn.ts";
import { waitForReady } from "../../infra/wait-for-ready.ts";
import { createFirmwareHistoryEntry } from "../../api/device.ts";
import db from "../../db/db.ts";
import { errorHandler } from "../../util/error-handler.ts";
import { SyncDataType } from "../../constants.ts";
import { loadScript } from "../../util/load-script.ts";
import { getActiveUser } from "../../util/get-logged-in-user.ts";
import { getLatestFirmwareVersion } from "./util/get-latest-firmware-version.ts";

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
  } catch (error) {
    errorHandler({ error, exit: true });
  }
};

const flash = async (
  firmwareVersion: string,
  fileName: string,
  initialFirmware?: boolean,
) => {
  console.log("flashing", firmwareVersion, "to device");

  await probeRsCheck();
  const dirPath = getRrivCtlDir();

  const script = `../src/modules/firmware/scripts/${fileName}.sh`;

  await loadScript(script, `${fileName}.sh`);
  const cleanup = async () => {
    await spawn("rm", [`${fileName}.sh`]);
  };

  await spawn(
    "bash",
    [`${fileName}.sh`, dirPath, firmwareVersion],
    initialFirmware
      ? () => initialFirmwareRetry(dirPath, firmwareVersion)
      : cleanup,
  );
  await cleanup();

  if (initialFirmware) {
    await new Promise((resolve) => setTimeout(resolve, 7000));
  } else {
    await waitForReady(3000);
  }
  console.log("device successfully flashed...");
};

export const flashFirmware = async (firmwareVersion?: string) => {
  const {
    deviceContext: { deviceId, contextId },
    email,
    env,
    device: { id },
  } = getActiveUser();

  let versionToFlash = firmwareVersion;

  if (!versionToFlash) {
    versionToFlash = await getLatestFirmwareVersion();
  }

  await flash(versionToFlash, "flash-firmware");

  if (id && id !== "guest") {
    const dataToUpload = {
      version: versionToFlash,
      installedAt: new Date().toISOString(),
      deviceId,
      contextId,
    };
    try {
      await createFirmwareHistoryEntry({ ...dataToUpload });
    } catch (error) {
      db.update((data) => {
        data[email][env].toSync = [
          {
            requestId: randomUUID(),
            data: dataToUpload,
            type: SyncDataType.FirmwareHistory,
          },
        ];
      });
      console.log("firmware cloud upload failed");
      errorHandler({ error, exit: true });
    }
  }
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
