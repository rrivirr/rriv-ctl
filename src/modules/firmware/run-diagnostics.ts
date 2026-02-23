import { probeRsCheck } from "./util/probe-rs-check.ts";
import { getRrivCtlDir } from "../../util/paths.ts";
import { spawn } from "../../util/spawn.ts";
import { loadScript } from "../../util/load-script.ts";
import { getLatestFirmwareVersion } from "./util/get-latest-firmware-version.ts";
import { uploadFirmwareEntry } from "./util/upload-firmware-entry.ts";

export const runDiagnostics = async (customVersion?: string) => {
  let versionToFlash = customVersion;

  if (!versionToFlash) {
    versionToFlash = await getLatestFirmwareVersion(true);
  }
  await probeRsCheck();
  const dirPath = getRrivCtlDir();

  const fileName = "run-diagnostics.sh";
  const script = `../src/modules/firmware/scripts/${fileName}`;

  await loadScript(script, `${fileName}`);
  const cleanup = async () => {
    console.log("time to clean up");
    await spawn("rm", [`${fileName}`]);
    await uploadFirmwareEntry(`diagnostic-${versionToFlash}`);
  };

  await spawn("bash", [`${fileName}`, dirPath, versionToFlash], cleanup);
};
