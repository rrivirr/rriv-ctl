import {
  listConfigHistory,
  getConfigHistoryAtTime,
  applyConfigHistory,
} from "../../modules/config/config-history.service.ts";
import { Resource } from "../../types.ts";
import { oraPromise } from "../../util/ora-promise.ts";

const validateSensorId = (object: string, sensorId?: string) => {
  if (object === "sensor" && !sensorId) {
    throw new Error("sensor id is required");
  }
};

export const refactorDatetime = (datetime: string) => {
  let date, time;
  if (datetime) {
    [date, time] = datetime.split("T");
    if (!date) {
      throw new Error("invalid datetime received");
    }
  } else {
    const now = new Date();
    date = `${now.getFullYear()}:${now.getMonth() + 1}:${now.getDate()}`;
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
    new Date(new Date().setFullYear(+year, +month - 1, +day)).setHours(hour),
  ).setMinutes(minute);
  return new Date(dateSpecified).toISOString();
};

export const getAction = async (
  object: Resource,
  deviceIdentifier: string,
  datetime: string,
  options: any,
) => {
  const { sensorId } = options;
  validateSensorId(object, sensorId);
  await oraPromise(() =>
    getConfigHistoryAtTime({
      deviceIdentifier,
      sensorId,
      resource: object,
      datetime: refactorDatetime(datetime),
    }),
  );
};

export const applyAction = async (
  object: Resource,
  datetime: string,
  deviceIdentifier: string,
  options: any,
) => {
  const { sensorId } = options;
  validateSensorId(object, sensorId);
  await oraPromise(() =>
    applyConfigHistory({
      deviceIdentifier,
      sensorId,
      resource: object,
      datetime: refactorDatetime(datetime),
    }),
  );
};

export const listAction = async (
  object: Resource,
  deviceIdentifier: string,
  options: any,
) => {
  const { number, sensorId } = options;
  if (number && !+number) {
    throw new Error("Not a valid number");
  }
  validateSensorId(object, sensorId);

  await oraPromise(() =>
    listConfigHistory({
      deviceIdentifier,
      sensorId,
      limit: number,
      resource: object,
    }),
  );
};
