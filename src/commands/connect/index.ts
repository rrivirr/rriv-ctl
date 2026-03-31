import { Command } from "commander";
import { connectAction } from "./action.ts";

export const makeConnectCommand = (cli: Command) => {
  cli
    .command("connect")
    .option(
      "-a, --assigned-device-name <assigned device name>",
      "name to assign to a device in current context",
    )
    .option("-p, --path <serial path>", "serial path of the RRIV device")
    .option("-i, --interactive-mode", "set device to use interactive mode")
    .action(connectAction);
};
