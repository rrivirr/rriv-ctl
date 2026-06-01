import { Command } from "commander";
import {
  createAction,
  useAction,
  deleteAction,
  endContextAction,
  endDeviceContextAction,
  listContextAction,
  listDeviceContextAction,
  renameDeviceInContextAction,
} from "./action.ts";

export const makeContextCommand = (cli: Command) => {
  const contextCommand = cli.command("context");

  contextCommand.command("create").argument("name").action(createAction);
  contextCommand.command("use").argument("name").action(useAction);
  contextCommand.command("end").argument("[name]").action(endContextAction);
  contextCommand
    .command("list")
    .action(listContextAction)
    .option("-n, --name <name>")
    .option("-s, --search <search>");
  contextCommand.command("delete").argument("name").action(deleteAction);

  const deviceContextCommand = contextCommand.command("device");
  deviceContextCommand.command("end").action(endDeviceContextAction);
  deviceContextCommand.command("list").action(listDeviceContextAction);
  deviceContextCommand
    .command("rename")
    .argument("name")
    .option(
      "-d, --device-identifier <deviceIdentifier>",
      "rename device other than the currently attached device.",
    )
    .action(renameDeviceInContextAction);
};
