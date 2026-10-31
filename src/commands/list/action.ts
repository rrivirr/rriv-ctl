import { sendCommands } from "../../infra/send-commands.ts";
import { oraPromise } from "../../util/ora-promise.ts";

export const listAction = async (object: string) => {
  const payload = new Map();
  payload.set("object", object);
  payload.set("action", "list");
  const payloadString = JSON.stringify(Object.fromEntries(payload));

  await oraPromise(() => sendCommands([payloadString]));
};
