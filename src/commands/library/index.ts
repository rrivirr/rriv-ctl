import { Argument, Command, Option } from "commander";
import {
  publishAction,
  saveAction,
  getAction,
  listAction,
  applyAction,
} from "./action.ts";

export const makeLibraryCommand = (cli: Command) => {
  const libraryCommand = cli.command("library");

  const objectArgument = new Argument("<object>", "resource").choices([
    "sensor",
    "datalogger",
    "device",
  ]);
  const sensorIdOption = new Option(
    "-s, --sensor-id <sensorId>",
    "Specify the sensor id"
  );

  libraryCommand
    .command("save")
    .addArgument(objectArgument)
    .argument("name", "library name")
    .argument("[datetime]", "<YYYY:MM:DD>T[HH:MM]")
    .addOption(sensorIdOption)
    .option(
      "-d, --device-id <deviceId>",
      "Get the configuration to tag from device other than the currently attached device."
    )
    .option(
      "-f, --file-name <fileName>",
      "Specify a json file containing configuration to save"
    )
    .option("-u, --update", "save to a pre-existing library")
    .option("-n, --note", "Store a descriptive note")
    .action(saveAction);

  libraryCommand
    .command("apply")
    .addArgument(objectArgument)
    .argument("name", "[owner::]library_name[:version]")
    .addOption(sensorIdOption)
    .action(applyAction);

  libraryCommand
    .command("publish")
    .addArgument(objectArgument)
    .argument("name", "library_name")
    .action(publishAction);

  libraryCommand
    .command("list")
    .addArgument(objectArgument)
    .argument("[libraryName]", "[owner::]<library_name>")
    .option(
      "-f, --filter <filter>",
      "Filter library names for a specified string"
    )
    .action(listAction);

  libraryCommand
    .command("get")
    .addArgument(objectArgument)
    .argument("name", "[owner::]library_name[:version]")
    .action(getAction);
};
