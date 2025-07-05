import { sendCommandAndEchoResponse } from "../../util/send-command-and-echo-response.ts";

export const removeAction = (object: string, id: string) => {
  const payload = new Map();
  payload.set("object", object);
  payload.set("action", "remove");
  payload.set("id", id);
  const payloadString = JSON.stringify(Object.fromEntries(payload)) + "\n";
  console.log(payloadString);

  sendCommandAndEchoResponse(payloadString);
};
