import { Command } from "commander";
import {
  debugAction,
  flashAction,
  listFirmwareHistoryAction,
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

  cli
    .command("firmware")
    .command("get")
    .command("history")
    .description("get the firmware history of a device")
    .argument("[serialNumber]")
    .action(listFirmwareHistoryAction);
};
