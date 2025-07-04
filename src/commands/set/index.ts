import { Argument, Command } from "commander";
import { setAction } from "./action.ts";
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
};
