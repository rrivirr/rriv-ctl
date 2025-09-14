import { Argument, Command } from "commander";
import { useAction } from "./action.ts";

export const makeUseCommand = (cli: Command) => {
  cli
    .command("use")
    .addArgument(new Argument("<object>", "resource").choices(["context"]))
    .argument("<name>", "name of resource to use")
    .action(useAction);
};
