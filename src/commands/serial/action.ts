import { sendCommandAndEchoResponse } from "../../util/send-command-and-echo-response.ts";

export const serialAction = async (action: string, message: string) => {
  let message_to_send = message;
  if (message_to_send.startsWith("0x")) {
    console.log("Sending hex");
    message_to_send = message.substring(2);
    console.log(message_to_send);
  }

  const payload = new Map();
  payload.set("object", "serial");
  payload.set("action", action);
  payload.set("message", message_to_send);

  const payloadString = JSON.stringify(Object.fromEntries(payload)) + "\n";
  console.log(payloadString);

  await sendCommandAndEchoResponse(payloadString);
};
