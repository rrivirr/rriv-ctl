import { Command } from "commander";
import { debugAction, flashAction } from "./action.ts";

export const makeFirmwareCommands = (cli: Command) => {
  const probeCommand = cli.command("probe");

  probeCommand
    .command("debug")
    .description("attach to debug logs")
    .action(debugAction);

  cli
    .command("flash")
    .description("flash the firmware on the connected device")
    .argument("<firmwareVersion>")
    .action(flashAction);
};
