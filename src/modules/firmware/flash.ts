import ChildProcess from "child_process";
import util from "util";
import { probeRsCheck } from "./util/probe-rs-check.ts";
import { getRrivCtlDir } from "../../util/paths.ts";

export const flashFirmware = async (firmwareVersion: string) => {
  await probeRsCheck();

  const exec = util.promisify(ChildProcess.exec);
  const dirPath = getRrivCtlDir();

  await exec(
    `curl --proto '=https' --tlsv1.2 -Lfo ${dirPath}/rriv-firmware.bin https://github.com/rrivirr/rriv-firmware/releases/download/${firmwareVersion}/rriv-firmware.bin`
  );
  await exec(`probe-rs download ${dirPath}/rriv-firmware.bin \
	--chip STM32F103RE  \
 	--protocol swd \
	--allow-erase-all \
	--chip-erase`);
  await exec(`rm ${dirPath}/rriv-firmware.bin`);
};
