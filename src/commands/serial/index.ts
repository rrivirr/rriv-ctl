import { Argument, Command } from "commander";
import { serialAction } from "./action.ts";

export const makeSerialCommand = (cli: Command) => {
  cli
    .command("serial")
    .addArgument(new Argument("action").choices(["send"]))
    .argument("<message>")
    .description("board command: send payload to usart output")
    .action(serialAction);
};
