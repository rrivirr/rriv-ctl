import { Command } from "commander";
import { listContextAction, useAction } from "./action.ts";

export const makeContextCommand = (cli: Command) => {
  const contextCommand = cli.command("context");

  contextCommand.command("use").argument("name").action(useAction);

  contextCommand
    .command("list")
    .action(listContextAction)
    .option("-n, --name <name>")
    .option("-s, --search <search>");
};
