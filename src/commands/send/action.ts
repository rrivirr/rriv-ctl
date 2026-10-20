import { logAsDebug } from "../../util/debug-logger.ts";
import { sendCommands } from "../../infra/send-commands.ts";
import { oraPromise } from "../../util/ora-promise.ts";

export const sendAction = async (
  object: string,
  id: string,
  command: string,
) => {
  const payload = { object, action: "send", id, command };
  logAsDebug("payload to be sent", payload);
  const result = await oraPromise(() =>
    sendCommands([JSON.stringify(payload)]),
  );
  console.log(result[0]);
  console.log("successful");
};
