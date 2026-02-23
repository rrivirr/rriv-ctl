import { listFirmwareHistory } from "../../modules/firmware/firmware.service.ts";
import { flashFirmware } from "../../modules/firmware/flash.ts";
import { probeDebug } from "../../modules/firmware/probe-debug.ts";
import { runDiagnostics } from "../../modules/firmware/run-diagnostics.ts";

export const flashAction = async (firmwareVersion?: string) => {
  await flashFirmware(firmwareVersion);
};

export const debugAction = async (firmwareVersion: string) => {
  await probeDebug(firmwareVersion);
};

export const listFirmwareHistoryAction = async (serialNumber?: string) => {
  await listFirmwareHistory(serialNumber);
};

export const diagnosticAction = async (firmwareVersion?: string) => {
  await runDiagnostics(firmwareVersion);
};
