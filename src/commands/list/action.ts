import { listContexts } from "../../modules/context/context.service.ts";
import { listConfigSnapshot } from "../../modules/config/config-snapshot.service.ts";
import { listDevices } from "../../modules/device/device.service.ts";
import { sendCommands } from "../../infra/send-commands.ts";

export const listAction = async (object: string, options: any) => {
  if (["sensor", "actuator", "telemeter"].includes(object)) {
    const payload = new Map();
    payload.set("object", object);
    payload.set("action", "list");
    const payloadString = JSON.stringify(Object.fromEntries(payload));

    await sendCommands([payloadString]);
  } else if (object === "context") {
    await listContexts(options);
  } else if (object === "device") {
    await listDevices(options?.all);
  } else if (object === "config-snapshot") {
    await listConfigSnapshot(options);
  }
};
