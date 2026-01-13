import { Argument, Command } from "commander";
import { sendAction } from "./action.ts";

export const makeSendCommand = (cli: Command) => {
  cli
    .command("send")
    .addArgument(new Argument("<object>").choices(["sensor", "command"]))
    .argument("id|command")
    .argument("command|identifier")
    .action(sendAction);
};
