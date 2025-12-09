import { probeRsCheck } from "./util/probe-rs-check.ts";
import { getRrivCtlDir } from "../../util/paths.ts";
import { spawn } from "../../util/spawn.ts";
import { loadScript } from "../../util/load-script.ts";

export const probeDebug = async (firmwareVersion: string) => {
  await probeRsCheck();

  const dirPath = getRrivCtlDir();
  const script = `../src/modules/firmware/scripts/probe-debug.sh`;
  await loadScript(script, "probe-debug.sh");
  const cleanup = async () => {
    await spawn("rm", ["probe-debug.sh"]);
  };
  await spawn("bash", ["probe-debug.sh", dirPath, firmwareVersion], cleanup);
  await cleanup();
};
