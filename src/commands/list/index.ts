import { Argument, Command } from "commander";
import { listAction } from "./action.ts";

export const makeListCommand = (cli: Command) => {
  cli
    .command("list")
    .addArgument(
      new Argument("<object>", "resource").choices([
        "sensor",
        "actuator",
        "telemeter",
        "context",
        "device",
        "config-snapshot",
        "config-history",
        "library-config-snapshot",
        "library-sensor-config",
        "library-datalogger-config",
      ])
    )
    .option("-n, --name <name>", "get resource with specified name")
    .option(
      "-s, --search <search>",
      "get resources with names that includes specified parameter"
    )
    .option(
      "-p, --private <private>",
      "true/false, get library configs that belong to you"
    )
    .option("-t, --as-at <asAt>", "get config snapshot as at specified time")
    .option("-a, --all", "get all devices bound to you")
    .description("list resources")
    .action(listAction);
};
