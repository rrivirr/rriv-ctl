import { Argument, Command } from "commander";
import { logToConsole } from "../util/console-log.ts";
import { createContext } from "../modules/context/context.service.ts";

export const makeCreateCommand = (cli: Command) => {
  cli
    .command("create")
    .addArgument(new Argument("<object>", "resource").choices(["context"]))
    .option("-n, --name <name>")
    .action(async (object, options) => {
      if (object === "context") {
        if (!options.name) {
          logToConsole("name flag is required");
          return;
        }
        await createContext(options);
      }
    });
};
