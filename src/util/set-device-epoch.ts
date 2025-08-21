import serialCommands from "./serial-commands.ts";
import { sendCommandAndEchoResponse } from "./send-command-and-echo-response.ts";

export const setDeviceEpoch = async () => {
  const now = Date.now();
  const epoch = Math.floor(now / 1000);
  const payload = {
    object: "board",
    action: "set",
    epoch,
  };

  const command = JSON.stringify(payload) + "\n";
  await sendCommandAndEchoResponse(
    serialCommands.interactiveModeCommand + command
  );
};
