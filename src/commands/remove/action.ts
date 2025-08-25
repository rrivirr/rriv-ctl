import { unbindDevice } from "../../modules/device/device.service.ts";
import { sendCommands } from "../../util/send-commands.ts";

export const removeAction = async (object: string, id: string) => {
  if (object === "device") {
    await unbindDevice(id);
    return;
  }
  const payload = new Map();
  payload.set("object", object);
  payload.set("action", "remove");
  payload.set("id", id);
  const payloadString = JSON.stringify(Object.fromEntries(payload)) + "\n";
  console.log(payloadString);

  await sendCommands([payloadString]);
};
