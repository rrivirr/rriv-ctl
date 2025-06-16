import { sendCommandAndEchoResponse } from "../../util/send-command-and-echo-response.ts";

export const listLegacyAction = (object: string) => {
  let payload = new Map();
  payload.set("object", object);
  payload.set("action", "list");
  let payloadString = JSON.stringify(Object.fromEntries(payload)) + "\n";

  sendCommandAndEchoResponse(payloadString);
};
