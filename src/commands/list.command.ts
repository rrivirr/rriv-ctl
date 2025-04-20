import { Argument, Command } from "commander";
import { logToConsole } from "../util/console-log.ts";

export const makeListCommand = (cli: Command) => {
  cli
    .command("list")
    .addArgument(
      new Argument("<object>", "resource").choices([
        // "sensor",
        // "datalogger",
        "config-snapshot",
        "config-history",
        "config-library",
        "sensor-config-library",
        "datalogger-config-library",
        "context",
      ])
    )
    .option("-c, --current", "get the current resource in use")
    .option("-n, --name", "get resource with specified name")
    .option("-id", "get resource with specified id")
    .description("list resources")
    .action((object) => {
      logToConsole(object);
    });
};
