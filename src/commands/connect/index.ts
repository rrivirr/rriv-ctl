import { Command } from "commander";
import { connectAction } from "./action.ts";

export const makeConnectCommand = (cli: Command) => {
  cli
    .command("connect")
    .option("-p, --path <serial path>", "serial path of the RRIV device")
    .option("-i, --interactive-mode", "set device to use interactive mode")
    .action(connectAction);
};
