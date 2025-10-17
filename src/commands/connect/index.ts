import { Command } from "commander";
import { connectAction } from "./action.ts";

export const makeConnectCommand = (cli: Command) => {
  cli
    .command("connect")
    .option(
      "-a, --assignedDeviceName <assignedDeviceName>",
      "name to assign to a device in current context"
    )
    .option("-p, --path <serial_path>", "serial path of the RRIV device")
    .action(connectAction);
};
