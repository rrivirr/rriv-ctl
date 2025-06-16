import { Argument, Command } from "commander";
import { listLegacyAction } from "./action.ts";

export const makeListLegacyCommand = (cli: Command) => {
  cli
    .command("listL")
    .addArgument(
      new Argument("<object>").choices(["sensor", "actuator", "telemeter"])
    )
    .description("get values on an object or create an object")
    .action(listLegacyAction);
};
