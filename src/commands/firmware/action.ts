import { listFirmwareHistory } from "../../modules/firmware/firmware.service.ts";
import { clearEeprom, flashFirmware } from "../../modules/firmware/flash.ts";
import { probeDebug } from "../../modules/firmware/probe-debug.ts";
import { runDiagnostics } from "../../modules/firmware/run-diagnostics.ts";
import { oraPromise } from "../../util/ora-promise.ts";

export const flashAction = async (firmwareVersion?: string) => {
  await oraPromise(() => flashFirmware(firmwareVersion));
};

export const debugAction = async (firmwareVersion: string) => {
  await probeDebug(firmwareVersion);
};

export const listFirmwareHistoryAction = async (serialNumber?: string) => {
  await oraPromise(() => listFirmwareHistory(serialNumber));
};

export const diagnosticAction = async (firmwareVersion?: string) => {
  await runDiagnostics(firmwareVersion);
};

export const firmwareResetAction = async () => {
  await oraPromise(() => clearEeprom("config"));
  await oraPromise(flashFirmware);
};
