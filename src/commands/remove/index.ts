import { Argument, Command } from "commander";
import { removeAction } from "./action.ts";

export const makeRemoveCommand = (cli: Command) => {
  cli
    .command("remove")
    .addArgument(new Argument("<object>").choices(["sensor", "telemeter"]))
    .option("-a, --all", "remove all sensors")
    .argument("[id]")
    .description("remove an object")
    .action(removeAction);
};
