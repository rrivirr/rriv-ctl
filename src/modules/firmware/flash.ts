import { probeRsCheck } from "./util/probe-rs-check.ts";
import { getRrivCtlDir } from "../../util/paths.ts";
import { spawn } from "../../util/spawn.ts";

export const flashFirmware = async (firmwareVersion: string) => {
  await probeRsCheck();

  const dirPath = getRrivCtlDir();
  await spawn("sh", [
    `${process.cwd()}/src/modules/firmware/scripts/flash-firmware.sh`,
    dirPath,
    firmwareVersion,
  ]);
};
