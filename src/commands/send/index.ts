import { Argument, Command } from "commander";
import { sendAction } from "./action.ts";

export const makeSendCommand = (cli: Command) => {
  cli
    .command("send")
    .addArgument(new Argument("<object>").choices(["sensor"]))
    .argument("<id>")
    .argument("<command>")
    .action(sendAction);
};
