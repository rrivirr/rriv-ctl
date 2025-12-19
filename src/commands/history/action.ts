import {
  listConfigHistory,
  getConfigHistoryAtTime,
  applyConfigHistory,
} from "../../modules/config/config-history.service.ts";

const validateSensorId = (object: string, sensorId?: string) => {
  if (object === "sensor" && !sensorId) {
    throw new Error("sensor id is required");
  }
};

const refactorDatetime = (datetime: string) => {
  const [date, time] = datetime.split("T");
  if (!date) {
    throw new Error("invalid datetime received");
  }

  let hour = 0,
    minute = 0;

  const [year, month, day] = date.split(":");
  if (time) {
    const hourMinute = time.split(":");
    hour = +hourMinute[0];
    minute = +hourMinute[1];
  }

  const dateSpecified = new Date(
    new Date(new Date().setFullYear(+year, +month - 1, +day)).setHours(hour)
  ).setMinutes(minute);
  return dateSpecified;
};

export const getAction = async (
  object: string,
  datetime: string,
  options: any
) => {
  const { deviceId, sensorId } = options;
  validateSensorId(object, sensorId);
  await getConfigHistoryAtTime({
    deviceId,
    sensorId,
    resource: object,
    datetimeNumber: refactorDatetime(datetime),
  });
};

export const applyAction = async (
  object: string,
  datetime: string,
  options: any
) => {
  const { deviceId, sensorId } = options;
  validateSensorId(object, sensorId);
  await applyConfigHistory({
    deviceId,
    sensorId,
    resource: object,
    datetimeNumber: refactorDatetime(datetime),
  });
};

export const listAction = async (object: string, options: any) => {
  const { number, deviceId, sensorId } = options;
  if (number && !+number) {
    throw new Error("Not a valid number");
  }
  validateSensorId(object, sensorId);

  await listConfigHistory({
    deviceId,
    sensorId,
    limit: number,
    resource: object,
  });
};
