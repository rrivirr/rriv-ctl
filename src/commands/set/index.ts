import { Argument, Command } from "commander";
import { setAction, sendAction } from "./action.ts";
import { CONFIGS } from "../../constants.ts";

export const makeSetCommand = (cli: Command) => {
  cli
    .command("set")
    .addArgument(new Argument("<object>").choices(CONFIGS))
    .argument("[id]")
    .argument("[property]")
    .argument("[property_value]")
    .option("-f, --file <file>")
    .description("set values on an object or create an object")
    .action(setAction);

  // TEMP LOCATION
  cli
    .command("send")
    .addArgument(new Argument("<object>").choices(["sensor"]))
    .argument("id")
    .argument("command")
    .description("set values on an object or create an object")
    .action(sendAction);
};
