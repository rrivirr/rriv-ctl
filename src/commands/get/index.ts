import { Argument, Command } from "commander";
import { getAction } from "./action.ts";

export const makeGetCommand = (cli: Command) => {
  cli
    .command("get")
    .addArgument(
      new Argument("<object>").choices([
        "sensor",
        "actuator",
        "telemeter",
        "board",
      ])
    )
    .argument("[id]")
    .argument("[parameter]")
    .description("get values on an object")
    .action(getAction);
};
