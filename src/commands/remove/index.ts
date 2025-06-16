import { Argument, Command } from "commander";
import { removeAction } from "./action.ts";

export const makeRemoveCommand = (cli: Command) => {
  cli
    .command("remove")
    .addArgument(
      new Argument("<object>").choices(["sensor", "actuator", "telemeter"])
    )
    .argument("<id>")
    .description("remove an object")
    .action(removeAction);
};
