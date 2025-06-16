import { sendCommandAndEchoResponse } from "../../util/send-command-and-echo-response.ts";

export const calibrateAction = (
  object: string,
  id?: string,
  subcommand?: string,
  point?: string,
  tag?: string
) => {
  let payload = new Map();
  payload.set("object", object);
  payload.set("action", "calibrate");
  payload.set("id", id);
  payload.set("subcommand", subcommand);

  if (subcommand === "point") {
    if (!point) {
      console.log("Point subcommand requires a point value");
      process.exit(1);
    } else {
      payload.set("point", parseFloat(point));
      payload.set("tag", tag);
    }
  }

  let payloadString = JSON.stringify(Object.fromEntries(payload)) + "\n";
  console.log(payloadString);

  sendCommandAndEchoResponse(payloadString);
};
