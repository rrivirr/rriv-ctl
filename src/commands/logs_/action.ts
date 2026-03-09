import { addLog, listLogs } from "../../modules/device/device.service.ts";

export const listLogsAction = async (identifier?: string) => {
  await listLogs(identifier);
};

export const addLogAction = async (log: string, identifier?: string) => {
  await addLog(log, identifier);
};
