import { Argument, Command } from "commander";
import { publishAction } from "./action.ts";

export const makePublishCommand = (cli: Command) => {
  cli
    .command("publish")
    .addArgument(
      new Argument("<object>", "resource").choices([
        "config-snapshot",
        "current-config-snapshot",
        "current-sensor-config",
        "current-datalogger-config",
      ])
    )
    .requiredOption(
      "-l, --library-config-name <libraryConfigName>",
      "existing or new library config name"
    )
    .option(
      "-c, --config-snapshot-name <configSnapshotName>",
      "publish a saved config snapshot"
    )
    .option("-d, --description <description>", "add a description")
    .option(
      "-s, --sensor <sensor>",
      "specify which sensor config to publish (current-sensor-config)"
    )
    .description("publish config to a library")
    .action(publishAction);
};
