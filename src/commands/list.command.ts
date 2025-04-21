import { Argument, Command } from "commander";
import { listContexts } from "../modules/context/context.service.ts";
import { listConfigHistory } from "../modules/config/config-history.service.ts";
import { listConfigSnapshot } from "../modules/config/config-snapshot.service.ts";

export const makeListCommand = (cli: Command) => {
  cli
    .command("list")
    .addArgument(
      new Argument("<object>", "resource").choices([
        "config-snapshot",
        "config-history",
        // "config-library",
        // "sensor-config-library",
        // "datalogger-config-library",
        "context",
      ])
    )
    .option("-c, --current", "get the current resource in use")
    .option("-n, --name <name>", "get resource with specified name")
    .description("list resources")
    .action(async (object, options) => {
      if (object === "context") {
        await listContexts(options);
      } else if (object === "config-history") {
        if (Object.keys(options).length) {
          console.log("option not supported by config history");
          process.exit();
        }
        await listConfigHistory();
      } else if (object === "config-snapshot") {
        await listConfigSnapshot(options);
      }
    });
};
