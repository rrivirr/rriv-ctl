import { sendCommands } from "../../infra/send-commands.ts";
import { oraPromise } from "../../util/ora-promise.ts";

export const getAction = async (
  object: string,
  id: string,
  parameter: string,
) => {
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
