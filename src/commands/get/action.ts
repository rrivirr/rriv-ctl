import fs from "fs";
import { getReadings } from "../../api/readings.ts";
import { sendCommands } from "../../infra/send-commands.ts";
import { getConfigSnapshot } from "../../modules/config/config-snapshot.service.ts";
import { getDevices } from "../../api/device.ts";

export const getAction = async (
  object: string,
  id?: string,
  parameter?: string,
  endDate?: string
) => {
  if (object === "data") {
    const startDate = parameter;

    if (!id) {
      throw new Error("device identifier required");
    }

    const device = await getDevices({ identifier: id });
    if (!device.length) {
      console.log("no device found with specified identifier");
      return;
    }
    const eui = device[0].DeviceEuis[0]?.eui;
    if (!eui) {
      console.log("no euis registered for device");
      return;
    }

    const dirPath = "./data";
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    const file = await getReadings({ eui, dirPath, startDate, endDate });
    if (file) {
      console.log(`saved to ${file}`);
    }
    return;
  } else if (object === "config-snapshot") {
    await getConfigSnapshot();
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
      payload.set("id", id);
    }
    if (parameter) {
      payload.set("parameter", parameter);
    }
  }
  const payloadString = JSON.stringify(Object.fromEntries(payload));
  await sendCommands([payloadString]);
};
