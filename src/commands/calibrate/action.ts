import { sendCommands } from "../../infra/send-commands.ts";
import { oraPromise } from "../../util/ora-promise.ts";

export const calibrateAction = async (
  object: string,
  id?: string,
  subcommand?: string,
  point?: string,
  _tag?: string,
) => {
  const payload = new Map();
  payload.set("object", object);
  payload.set("action", "calibrate");
  payload.set("id", id);
  payload.set("subcommand", subcommand);

  if (subcommand === "point") {
    if (!point) {
      throw new Error("Point subcommand requires a point value");
    } else {
      payload.set("point", parseFloat(point));
      // payload.set("tag", tag);
    }
  }

  const payloadString = JSON.stringify(Object.fromEntries(payload));

  await oraPromise(() => sendCommands([payloadString]));
};
