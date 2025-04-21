import { Argument, Command } from "commander";
import { logToConsole } from "../util/console-log.ts";
import { useContext } from "../modules/context/context.service.ts";

export const makeUseCommand = (cli: Command) => {
  cli
    .command("use")
    .addArgument(
      new Argument("<object>", "resource").choices([
        "context",
        // "config-snapshot", apoly saved config snapshot or snapshot from library
        // sensor-config, apply sensor config from library
        // datalogger-config, apply datalogger config from library
      ])
    )
    .option("-n, --name <name>")
    .action(async (object, options) => {
      if (object === "context") {
        if (!options.name) {
          logToConsole("name flag is required");
          return;
        }
        await useContext(options);
      }
    });
};
