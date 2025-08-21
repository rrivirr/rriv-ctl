import { sendCommandAndEchoResponse } from "../../util/send-command-and-echo-response.ts";

export const calibrateAction = async (
  object: string,
  id?: string,
  subcommand?: string,
  point?: string,
  _tag?: string
) => {
  const payload = new Map();
  payload.set("object", object);
  payload.set("action", "calibrate");
  payload.set("id", id);
  payload.set("subcommand", subcommand);

  if (subcommand === "point") {
    if (!point) {
      console.log("Point subcommand requires a point value");
      return;
    } else {
      payload.set("point", parseFloat(point));
      // payload.set("tag", tag);
    }
  }

  const payloadString = JSON.stringify(Object.fromEntries(payload)) + "\n";
  console.log(payloadString);

  await sendCommandAndEchoResponse(payloadString);
};
