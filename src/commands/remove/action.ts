import { unbindDevice } from "../../modules/device/device.service.ts";
import { sendCommands } from "../../infra/send-commands.ts";
import { oraPromise } from "../../util/ora-promise.ts";

export const removeAction = async (
  object: string,
  id: string,
  options: any,
) => {
  const { all } = options;
  if (object === "sensor" && all) {
    const [sensors] = await oraPromise(() =>
      sendCommands(
        [JSON.stringify({ object: "sensor", action: "list" })],
        false,
      ),
    );

    if (sensors?.sensors?.length) {
      await oraPromise(() =>
        sendCommands(
          sensors.sensors.map((s: any) =>
            JSON.stringify({ object: "sensor", action: "remove", id: s.id }),
          ),
        ),
      );
    }
    return;
  }
  if (!id) {
    throw new Error("argument required");
  }
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
