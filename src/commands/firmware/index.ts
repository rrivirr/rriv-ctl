import { Command } from "commander";
import {
  debugAction,
  diagnosticAction,
  firmwareResetAction,
  flashAction,
} from "./action.ts";

export const makeFirmwareCommands = (cli: Command) => {
  const probeCommand = cli.command("probe");

  probeCommand
    .command("debug")
    .description("attach to debug logs")
    .argument("<firmwareVersion>")
    .action(debugAction);

  cli
    .command("flash")
    .description("flash the firmware on the connected device")
    .argument("[firmwareVersion]")
    .action(flashAction);

  const firmwareCommand = cli.command("firmware");

  firmwareCommand
    .command("diagnostic")
    .argument("[firmwareVersion]")
    .action(diagnosticAction);

  firmwareCommand.command("reset").action(firmwareResetAction);
};
