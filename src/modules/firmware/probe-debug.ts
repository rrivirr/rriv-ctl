import { assertNoBootloader } from "./util/bootloader-check.ts";
import { probeRsCheck } from "./util/probe-rs-check.ts";
import { getRrivCtlFirmwareDir } from "../../util/paths.ts";
import { spawn } from "../../util/spawn.ts";
import { loadScript } from "../../util/load-script.ts";

export const probeDebug = async (firmwareVersion: string, force = false) => {
  await probeRsCheck();
  await assertNoBootloader(force);

  const dirPath = getRrivCtlFirmwareDir();
  const script = `../src/modules/firmware/scripts/probe-debug.sh`;
  const newFilePath = await loadScript(script, "probe-debug.sh");
  await spawn("bash", [newFilePath, dirPath, firmwareVersion]);
};
