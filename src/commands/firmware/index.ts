import { Command } from "commander";
import {
  debugAction,
  flashAction,
  listFirmwareHistoryAction,
  diagnosticAction,
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
    .command("get")
    .command("history")
    .description("get the firmware history of a device")
    .argument("[serialNumber]")
    .action(listFirmwareHistoryAction);

  firmwareCommand
    .command("diagnostic")
    .argument("[firmwareVersion]")
    .action(diagnosticAction);
};
