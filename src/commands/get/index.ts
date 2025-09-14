import { Argument, Command } from "commander";
import { getAction } from "./action.ts";
import { CONFIGS } from "../../constants.ts";

export const makeGetCommand = (cli: Command) => {
  cli
    .command("get")
    .addArgument(
      new Argument("<object>").choices([...CONFIGS, "data", "config-snapshot"])
    )
    .argument("[id]")
    .argument("[parameterOrstartDate]")
    .argument("[endDate]")
    .description("get values on an object")
    .action(getAction);
};
