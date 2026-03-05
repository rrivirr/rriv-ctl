import { probeRsCheck } from "./util/probe-rs-check.ts";
import { getRrivCtlFirmwareDir } from "../../util/paths.ts";
import { spawn } from "../../util/spawn.ts";
import { loadScript } from "../../util/load-script.ts";

export const probeDebug = async (firmwareVersion: string) => {
  await probeRsCheck();

  const dirPath = getRrivCtlFirmwareDir();
  const script = `../src/modules/firmware/scripts/probe-debug.sh`;
  const newFilePath = await loadScript(script, "probe-debug.sh");
  await spawn("bash", [newFilePath, dirPath, firmwareVersion]);
};
