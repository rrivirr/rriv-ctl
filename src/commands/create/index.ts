import { Argument, Command } from "commander";
import { createAction } from "./action.ts";

export const makeCreateCommand = (cli: Command) => {
  cli
    .command("create")
    .addArgument(new Argument("<object>", "resource").choices(["context"]))
    .option("-n, --name <name>")
    .action(createAction);
};
