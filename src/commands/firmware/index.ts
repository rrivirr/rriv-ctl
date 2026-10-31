import { Command } from "commander";
import {
  debugAction,
  diagnosticAction,
  factoryResetAction,
  firmwareResetAction,
  flashAction,
  migrateAction,
  startupAction,
  updateAction,
} from "./action.ts";

export const makeFirmwareCommands = (cli: Command) => {
  const probeCommand = cli.command("probe");

  probeCommand
    .command("debug")
    .description("attach to debug logs")
    .argument("<firmwareVersion>")
    .option(
      "--force",
      "erase the whole chip even if the RRIV bootloader is installed",
    )
    .action(debugAction);

  cli
    .command("flash")
    .description("flash the firmware on the connected device")
    .argument("[firmwareVersion]")
    .option(
      "--force",
      "erase the whole chip even if the RRIV bootloader is installed",
    )
    .action(flashAction);

  const firmwareCommand = cli.command("firmware");

  firmwareCommand
    .command("diagnostic")
    .description(
      "trace the board's start-up step by step (older firmware: flash the diagnostic firmware with the probe)",
    )
    .argument("[firmwareVersion]")
    .option(
      "--force",
      "erase the whole chip even if the RRIV bootloader is installed",
    )
    .action(diagnosticAction);

  firmwareCommand
    .command("reset")
    .description(
      "reset the datalogger settings to their defaults and remove all sensors, keeping the serial number",
    )
    .option(
      "--force",
      "erase the whole chip even if the RRIV bootloader is installed",
    )
    .action(firmwareResetAction);

  firmwareCommand
    .command("update")
    .description(
      "install firmware over USB through the RRIV bootloader (no probe): the newest release the board's bootloader can take, a given release, or a signed image file",
    )
    .argument("[version]", "a release version (default: the newest)")
    .option("--file <path>", "install a signed image file (.bin) instead")
    .option("--pre-release", "include pre-releases when picking the newest")
    .action(updateAction);

  firmwareCommand
    .command("migrate")
    .description(
      "once per board, with the probe: move a board without the RRIV bootloader to it (bootloader + signed firmware from a release); settings and serial number stay",
    )
    .argument("[version]", "a release version (default: the latest)")
    .action(migrateAction);

  firmwareCommand
    .command("startup")
    .description("show how the board's last start-ups went")
    .action(startupAction);

  firmwareCommand
    .command("factory-reset")
    .description(
      "provisioners: wipe the board (serial number, settings, sensors); the device stays in RRIV",
    )
    .action(factoryResetAction);
};
