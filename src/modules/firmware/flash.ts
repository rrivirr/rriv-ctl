import { Octokit } from "@octokit/rest";
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

const flash = async (
  firmwareVersion: string,
  fileName: string,
  initialFirmware?: boolean
) => {
  await probeRsCheck();
  const dirPath = getRrivCtlDir();

  const script = `../src/modules/firmware/scripts/${fileName}.sh`;

  await loadScript(script, `${fileName}.sh`);
  await spawn("bash", [`${fileName}.sh`, dirPath, firmwareVersion]);
  await spawn("rm", [`${fileName}.sh`]);

  if (initialFirmware) {
    await new Promise((resolve) => setTimeout(resolve, 7000));
  } else {
    await waitForReady(3000);
  }
};

export const flashFirmware = async (firmwareVersion: string) => {
  const {
    deviceContext: { deviceId, contextId },
    email,
  } = getActiveUser();

  await flash(firmwareVersion, "flash-firmware");

  const dataToUpload = {
    version: firmwareVersion,
    installedAt: new Date().toISOString(),
    deviceId,
    contextId,
  };
  try {
    await createFirmwareHistoryEntry({ ...dataToUpload });
  } catch (error) {
    db.update((data) => {
      data[email].toSync = [
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
};

export const flashInitialFirmware = async (boardVersion: string) => {
  const octokit = new Octokit();
  const release = await octokit.repos.getLatestRelease({
    owner: "rrivirr",
    repo: "rriv-firmware",
  });
  const firmwareVersion = release.data.tag_name;
  if (boardVersion !== firmwareVersion) {
    console.log("flashing", firmwareVersion, "to device");
    await flash(firmwareVersion, "flash-initial-firmware", true);
  }
};
