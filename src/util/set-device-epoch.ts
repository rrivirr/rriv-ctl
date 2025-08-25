import { sendCommands } from "./send-commands.ts";
import serialCommands from "./serial-commands.ts";

export const setDeviceEpoch = async () => {
  const now = Date.now();
  const epoch = Math.floor(now / 1000);
  const payload = {
    object: "board",
    action: "set",
    epoch,
  };

  const command = JSON.stringify(payload) + "\n";
  await sendCommands([serialCommands.interactiveModeCommand, command]);
};
