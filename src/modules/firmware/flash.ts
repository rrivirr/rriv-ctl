import { exec } from "child_process";
import { probeRsCheck } from "./util/probe-rs-check.ts";
import { getRrivCtlDir } from "../../util/paths.ts";

export const flashFirmware = async (firmwareVersion: string) => {
  await probeRsCheck();

  const dirPath = getRrivCtlDir();

  const downloadFirmwareCommand = `curl --proto '=https' --tlsv1.2 -Lo ${dirPath}/rriv-firmware.bin https://github.com/rrivirr/rriv-firmware/releases/download/${firmwareVersion}/rriv-firmware.bin`;
  const flashCommand = `probe-rs download ${dirPath}/rriv-firmware.bin \
      --chip STM32F103RE  \
      --protocol swd \
      --allow-erase-all \
      --chip-erase`;
  const deleteFirmwareCommand = `rm ${dirPath}/rriv-firmware.bin`;

  const result = exec(
    `${downloadFirmwareCommand} && ${flashCommand} && ${deleteFirmwareCommand}`
  );
  result.stdout?.pipe(process.stdout);
};
