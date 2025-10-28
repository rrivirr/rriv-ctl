import { sendCommands } from "../../infra/send-commands.ts";
import { logAsDebug } from "../../util/debug-logger.ts";

export const serialAction = async (action: string, message: string) => {
  let message_to_send = message;
  if (message_to_send.startsWith("0x")) {
    logAsDebug("Sending hex");
    message_to_send = message.substring(2);
    logAsDebug(message_to_send);
  }

  const payload = new Map();
  payload.set("object", "serial");
  payload.set("action", action);
  payload.set("message", message_to_send);

  const payloadString = JSON.stringify(Object.fromEntries(payload));
  await sendCommands([payloadString]);
};
