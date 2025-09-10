import fs from "fs";
import { getReadings } from "../../api/readings.ts";
import { sendCommands } from "../../util/send-commands.ts";
import { getConfigSnapshot } from "../../modules/config/config-snapshot.service.ts";

export const getAction = async (
  object: string,
  id?: string,
  parameter?: string,
  endDate?: string
) => {
  if (object === "data") {
    const startDate = parameter;

    if (!id) {
      console.log("eui required");
      return;
    }

    const dirPath = "./data";
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    const file = await getReadings({ id, dirPath, startDate, endDate });
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
      console.log(id);
      payload.set("id", id);
    }
    if (parameter) {
      console.log(parameter);
      payload.set("parameter", parameter);
    }
  }
  const payloadString = JSON.stringify(Object.fromEntries(payload)) + "\n";
  console.log("sending command: ");
  console.log(payloadString);

  await sendCommands([payloadString]);
};
