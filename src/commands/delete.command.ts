import { Argument, Command } from "commander";
import { logToConsole } from "../util/console-log.ts";
import { deleteContext } from "../modules/context/context.service.ts";

export const makeDeleteCommand = (cli: Command) => {
  cli
    .command("delete")
    .addArgument(new Argument("<object>", "resource").choices(["context"]))
    .option("-n, --name <name>")
    .action(async (object, options) => {
      if (object === "context") {
        if (!options.name) {
          logToConsole("name flag is required");
          return;
        }
        await deleteContext(options);
      }
    });
};
