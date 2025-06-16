import { sendCommandAndEchoResponse } from "../../util/send-command-and-echo-response.ts";

export const serialAction = (action: string, message: string) => {
  let message_to_send = message;
  if (message_to_send.startsWith("0x")) {
    console.log("Sending hex");
    const number = Number(message_to_send);
    message_to_send = message.substring(2);
    console.log(message_to_send);
  }

  let payload = new Map();
  payload.set("object", "serial");
  payload.set("action", action);
  payload.set("message", message_to_send);

  let payloadString = JSON.stringify(Object.fromEntries(payload)) + "\n";
  console.log(payloadString);

  sendCommandAndEchoResponse(payloadString);
};
