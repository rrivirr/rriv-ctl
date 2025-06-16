import { Argument, Command } from "commander";
import { saveAction } from "./action.ts";

export const makeSaveCommand = (cli: Command) => {
  cli
    .command("save")
    .addArgument(
      new Argument("<object>", "resource").choices(["config-snapshot"])
    )
    .requiredOption("-n, --name <name>")
    .action(saveAction);
};
