import { getReadings } from "../../api/readings.ts";
import { sendCommands } from "../../infra/send-commands.ts";
import { getConfigSnapshot } from "../../modules/config/config-snapshot.service.ts";
import { getDevices } from "../../api/device.ts";
import { oraPromise } from "../../util/ora-promise.ts";

export const getAction = async (
  object: string,
  id: string,
  parameter: string,
  endDate: string,
  options: any,
) => {
  if (object === "data") {
    const startDate = parameter;
    const { fileName, limit } = options;

    if (!id) {
      throw new Error("device identifier required");
    }

    if (limit && !+limit) {
      throw new Error("invalid limit received");
    }

    const device = await oraPromise(() => getDevices({ identifier: id }));
    if (!device.length) {
      console.log("no device found with specified identifier");
      return;
    }
    const eui = device[0].DeviceEuis[0]?.eui;
    if (!eui) {
      console.log("no euis registered for device");
      return;
    }

    const file = await oraPromise(() =>
      getReadings({ eui, startDate, endDate, fileName, limit }),
    );
    if (file) {
      console.log(`saved to ${file}`);
    }
    return;
  } else if (object === "config-snapshot") {
    await oraPromise(getConfigSnapshot);
    return;
  }

  const payload = new Map();
  payload.set("object", object);
  payload.set("action", "get");
  if (object == "board") {
    if (id) {
      payload.set("parameter", id);
    }
  } else {
    if (id) {
      if (object === "sensor") {
        payload.set("id", id.toLowerCase());
      } else {
        payload.set("id", id);
      }
    }
    if (parameter) {
      payload.set("parameter", parameter);
    }
  }
  const payloadString = JSON.stringify(Object.fromEntries(payload));
  await oraPromise(() => sendCommands([payloadString]));
};
