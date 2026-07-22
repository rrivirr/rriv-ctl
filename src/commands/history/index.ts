import { Argument, Command, Option } from "commander";
import { getAction, listAction, applyAction } from "./action.ts";

export const makeHistoryCommand = (cli: Command) => {
  const historyCommand = cli.command("history");

  const objectArgument = new Argument("<object>", "resource").choices([
    "sensor",
    "datalogger",
    "device",
  ]);
  const deviceIdArgument = new Argument(
    "[deviceIdentifier]",
    "The device to list configuration history for.  If this is not specified then the history of the currently attached device is listed",
  );
  const sensorIdOption = new Option(
    "-s, --sensor-id <sensorId>",
    " Specify the sensor id, required when listing sensor configuration history",
  );

  historyCommand
    .command("list")
    .addArgument(objectArgument)
    .addArgument(deviceIdArgument)
    .addOption(sensorIdOption)
    .option("-n, --number <number>", "The number of entries to show at once")
    .action(listAction);

  historyCommand
    .command("get")
    .addArgument(objectArgument)
    .addArgument(deviceIdArgument)
    .argument("[datetime]", "<YYYY:MM:DD>T[HH:MM]")
    .addOption(sensorIdOption)
    .action(getAction);

  historyCommand
    .command("apply")
    .addArgument(objectArgument)
    .argument("datetime", "<YYYY:MM:DD>T[HH:MM]")
    .addArgument(deviceIdArgument)
    .addOption(sensorIdOption)
    .action(applyAction);
};
