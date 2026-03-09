import { Command } from "commander";
import { listLogsAction, addLogAction } from "./action.ts";

export const makeLogsCommand = (cli: Command) => {
  const logsCommand = cli.command("logs");

  logsCommand.command("list").argument("[identifier]").action(listLogsAction);
  logsCommand
    .command("add")
    .argument("log")
    .argument("[identifier]")
    .action(addLogAction);
};
