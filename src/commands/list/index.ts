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
        "device",
        "config-snapshot",
      ]),
    )
    .option("-n, --name <name>", "get resource with specified name")
    .option(
      "-s, --search <search>",
      "get resources with names that includes specified parameter",
    )
    .option(
      "-p, --private <private>",
      "true/false, get library configs that belong to you",
    )
    .description("list resources")
    .action(listAction);
};
