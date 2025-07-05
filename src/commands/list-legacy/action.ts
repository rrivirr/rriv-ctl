import { sendCommandAndEchoResponse } from "../../util/send-command-and-echo-response.ts";

export const listLegacyAction = (object: string) => {
  const payload = new Map();
  payload.set("object", object);
  payload.set("action", "list");
  const payloadString = JSON.stringify(Object.fromEntries(payload)) + "\n";

  sendCommandAndEchoResponse(payloadString);
};
