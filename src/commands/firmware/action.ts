import { flashFirmware } from "../../modules/firmware/flash.ts";
import { probeDebug } from "../../modules/firmware/probe-debug.ts";

export const flashAction = async (firmwareVersion: string) => {
  await flashFirmware(firmwareVersion);
};

export const debugAction = async () => {
  await probeDebug();
};
