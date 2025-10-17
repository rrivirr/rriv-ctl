import { probeRsCheck } from "./util/probe-rs-check.ts";
import { getRrivCtlDir } from "../../util/paths.ts";
import { spawn } from "../../util/spawn.ts";
import { waitForReady } from "../../infra/wait-for-ready.ts";

export const flashFirmware = async (firmwareVersion: string) => {
  await probeRsCheck();

  const dirPath = getRrivCtlDir();
  await spawn("sh", [
    `${process.cwd()}/src/modules/firmware/scripts/flash-firmware.sh`,
    dirPath,
    firmwareVersion,
  ]);

  await new Promise((resolve) => setTimeout(resolve, 3000));
  await waitForReady();
};

export const flashInitialFirmware = async (serialPortPath?: string) => {
  await probeRsCheck();

  const dirPath = getRrivCtlDir();
  await spawn("sh", [
    `${process.cwd()}/src/modules/firmware/scripts/flash-initial-firmware.sh`,
    dirPath,
  ]);

  await new Promise((resolve) => setTimeout(resolve, 3000));
  await waitForReady(serialPortPath);
};
