import { clearEeprom, flashFirmware } from "../../modules/firmware/flash.ts";
import { probeDebug } from "../../modules/firmware/probe-debug.ts";
import { runDiagnostics } from "../../modules/firmware/run-diagnostics.ts";

export const flashAction = async (firmwareVersion?: string) => {
  await flashFirmware(firmwareVersion);
};

export const debugAction = async (firmwareVersion: string) => {
  await probeDebug(firmwareVersion);
};

export const diagnosticAction = async (firmwareVersion?: string) => {
  await runDiagnostics(firmwareVersion);
};

export const firmwareResetAction = async () => {
  await clearEeprom("config");
  await flashFirmware();
};
