import { Argument, Command } from "commander";
import { listContexts } from "../modules/context/context.service.ts";
import { listConfigHistory } from "../modules/config/config-history.service.ts";
import { listConfigSnapshot } from "../modules/config/config-snapshot.service.ts";
import { listLibraryConfigSnapshot } from "../modules/config/library/config-snapshot.library.ts";
import { listLibrarySensorConfig } from "../modules/config/library/sensor-config.library.ts";
import { listLibraryDataloggerConfig } from "../modules/config/library/datalogger-config.library.ts";

export const makeListCommand = (cli: Command) => {
  cli
    .command("list")
    .addArgument(
      new Argument("<object>", "resource").choices([
        "config-snapshot",
        "config-history",
        "context",
        "library-config-snapshot",
        "library-sensor-config",
        "library-datalogger-config",
      ])
    )
    .option("-c, --current", "get the current context/config-snapshot in use, ")
    .option("-n, --name <name>", "get resource with specified name")
    .option(
      "-s, --search <search>",
      "get resources with names that includes specified parameter"
    )
    .option(
      "-p, --private <private>",
      "true/false, get library configs that belong to you"
    )
    .description("list resources")
    .action(async (object, options) => {
      let isPublic = undefined;

      const isPrivate = options.private;
      if (isPrivate) {
        isPublic = isPrivate === "true" ? false : true;
      }

      if (object === "context") {
        await listContexts(options);
      } else if (object === "config-history") {
        if (Object.keys(options).length) {
          throw new Error("option not supported by config history");
        }
        await listConfigHistory();
      } else if (object === "config-snapshot") {
        await listConfigSnapshot(options);
      } else if (object === "library-config-snapshot") {
        await listLibraryConfigSnapshot({ ...options, isPublic });
      } else if (object === "library-sensor-config") {
        await listLibrarySensorConfig({ ...options, isPublic });
      } else if (object === "library-datalogger-config") {
        await listLibraryDataloggerConfig({ ...options, isPublic });
      }
    });
};
