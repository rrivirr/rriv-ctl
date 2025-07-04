import { Command, Argument } from "commander";
import { applyAction } from "./action.ts";

export const makeApplyCommand = (cli: Command) => {
  cli
    .command("apply")
    .addArgument(
      new Argument("<object>", "resource").choices([
        "saved-config-snapshot",
        "published-config-snapshot",
        "published-sensor-config",
        "published-datalogger-config",
      ])
    )
    .requiredOption("-n, --name <name>", "resource name")
    .option(
      "-t, --tag <tag>", // v, version is used by commander
      "library version, if not specified, the latest version is selected"
    )
    .description("apply a saved config to the device")
    .action(applyAction);
};
