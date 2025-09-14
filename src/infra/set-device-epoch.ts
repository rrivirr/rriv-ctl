import { sendCommands } from "../infra/send-commands.ts";
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
  const result = await sendCommands(
    [serialCommands.interactiveModeCommand, command],
    false
  );
  const dataloggerConfig = result[0];
  return dataloggerConfig;
};
