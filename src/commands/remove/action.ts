import { unbindDevice } from "../../modules/device/device.service.ts";
import { sendCommands } from "../../infra/send-commands.ts";
import { oraPromise } from "../../util/ora-promise.ts";

export const removeAction = async (object: string, id: string) => {
  if (object === "device") {
    await oraPromise(() => unbindDevice(id));
    return;
  }
  const payload = new Map();
  payload.set("object", object);
  payload.set("action", "remove");
  payload.set("id", id);
  const payloadString = JSON.stringify(Object.fromEntries(payload));
  await oraPromise(() => sendCommands([payloadString]));
};
