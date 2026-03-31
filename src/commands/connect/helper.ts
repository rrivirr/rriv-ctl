import serialCommands from "../../infra/serial-commands.ts";
import { sendCommands } from "../../infra/send-commands.ts";

export const applyInitSettings = async (interactiveMode?: boolean) => {
  const now = Date.now();
  const epoch = Math.floor(now / 1000);
  const payload = {
    object: "board",
    action: "set",
    epoch,
  };
  const commands = [JSON.stringify(payload)];
  console.log("setting epoch...");

  if (interactiveMode) {
    console.log("setting device to interactive mode...");
    commands.push(serialCommands.interactiveModeCommand);
  }

  await sendCommands(commands, false);
};
