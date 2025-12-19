import { Argument, Command, Option } from "commander";
import { getAction, listAction, applyAction } from "./action.ts";

export const makeHistoryCommand = (cli: Command) => {
  const historyCommand = cli.command("history");

  const objectArgument = new Argument("<object>", "resource").choices([
    "sensor",
    "datalogger",
    "device",
  ]);
  const deviceIdOption = new Option(
    "-d, --device-id <deviceId>",
    "The device to list configuration history for.  If this option is not specified then the history of the currently attached device is listed"
  );
  const sensorIdOption = new Option(
    "-s, --sensor-id <sensorId>",
    " Specify the sensor id, required when listing sensor configuration history"
  );

  historyCommand
    .command("list")
    .addArgument(objectArgument)
    .addOption(deviceIdOption)
    .addOption(sensorIdOption)
    .option("-n, --number <number>", "The number of entries to show at once")
    .action(listAction);

  historyCommand
    .command("get")
    .addArgument(objectArgument)
    .argument("datetime", "<YYYY:MM:DD>T[HH:MM]")
    .addOption(deviceIdOption)
    .addOption(sensorIdOption)
    .action(getAction);

  historyCommand
    .command("apply")
    .addArgument(objectArgument)
    .argument("datetime", "<YYYY:MM:DD>T[HH:MM]")
    .addOption(deviceIdOption)
    .addOption(sensorIdOption)
    .action(applyAction);
};
