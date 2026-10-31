import { Argument, Command } from "commander";
import { listAction } from "./action.ts";

export const makeListCommand = (cli: Command) => {
  cli
    .command("list")
    .addArgument(
      new Argument("<object>", "resource").choices(["sensor", "telemeter"]),
    )
    .description("list resources on the device")
    .action(listAction);
};
