import { Command } from "commander";
import { provisionAction } from "./action.ts";

export const makeProvisionCommand = (cli: Command) => {
  const porvisionCommand = cli.command("provision");

  porvisionCommand
    .command("device")
    .option("-p, --path <serial_path>", "serial path of the RRIV device")
    .action(provisionAction);
};
