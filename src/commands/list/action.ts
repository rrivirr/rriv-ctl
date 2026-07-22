import { listConfigSnapshot } from "../../modules/config/config-snapshot.service.ts";
import { listDevices } from "../../modules/device/device.service.ts";
import { sendCommands } from "../../infra/send-commands.ts";
import { oraPromise } from "../../util/ora-promise.ts";

export const listAction = async (object: string, options: any) => {
  if (["sensor", "telemeter"].includes(object)) {
    const payload = new Map();
    payload.set("object", object);
    payload.set("action", "list");
    const payloadString = JSON.stringify(Object.fromEntries(payload));

    await oraPromise(() => sendCommands([payloadString]));
  } else if (object === "device") {
    await oraPromise(listDevices);
  } else if (object === "config-snapshot") {
    await oraPromise(() => listConfigSnapshot(options));
  }
};
