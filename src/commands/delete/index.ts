import { Argument, Command } from "commander";
import { deleteAction } from "./action.ts";

export const makeDeleteCommand = (cli: Command) => {
  cli
    .command("delete")
    .addArgument(new Argument("<object>", "resource").choices(["context"]))
    .option("-n, --name <name>")
    .action(deleteAction);
};
