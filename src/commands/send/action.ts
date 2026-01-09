import { logAsDebug } from "../../util/debug-logger.ts";
import { sendCommands } from "../../infra/send-commands.ts";
import { sendCommand } from "../../api/device.ts";

export const sendAction = async (
  object: string,
  idOrCommand: string,
  commandOrIdentifier: string
) => {
  if (object === "sensor") {
    const id = idOrCommand;
    const command = commandOrIdentifier;
    const payload = { object, action: "send", id, command };
    logAsDebug("payload to be sent", payload);
    const result = await sendCommands([JSON.stringify(payload)]);
    console.log(result[0]);
    console.log("successful");
  } else if (object === "command") {
    const command = idOrCommand;
    const identifier = commandOrIdentifier;

    const result = await sendCommand({ command, identifier });
    console.log(result);
  }
};
