import { addLog, listLogs } from "../../modules/device/device.service.ts";
import { oraPromise } from "../../util/ora-promise.ts";

export const listLogsAction = async (identifier?: string) => {
  await oraPromise(() => listLogs(identifier));
};

export const addLogAction = async (log: string, identifier?: string) => {
  await oraPromise(() => addLog(log, identifier));
};
