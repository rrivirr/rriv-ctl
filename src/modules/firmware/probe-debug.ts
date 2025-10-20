import { probeRsCheck } from "./util/probe-rs-check.ts";
import { getRrivCtlDir } from "../../util/paths.ts";
import { spawn } from "../../util/spawn.ts";

export const probeDebug = async (firmwareVersion: string) => {
  await probeRsCheck();

  const dirPath = getRrivCtlDir();
  await spawn("bash", [
    `${process.cwd()}/src/modules/firmware/scripts/probe-debug.sh`,
    dirPath,
    firmwareVersion,
  ]);
};
