import { Command } from "commander";
import { provisionAction, registerEuiAction } from "./action.ts";

export const makeProvisionCommand = (cli: Command) => {
  const porvisionCommand = cli.command("provision");

  porvisionCommand
    .command("device")
    .action(provisionAction)
    .option(
      "-s, --skip",
      "skip programming firmware and just provision the device with the cloud",
    )
    .option(
      "-f, --firmwareVersion <firmwareVersion>",
      "provision the device with a specific firmware version",
    )
    .option(
      "--factory",
      "indicates that the device has no previous firmware programmed on it",
    );

  porvisionCommand
    .command("telemeter")
    .argument("[application]")
    .action(registerEuiAction);
};
