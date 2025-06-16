import { Command } from "commander";
import { connectAction } from "./action.ts";

export const makeConnectCommand = (cli: Command) => {
  cli.command("connect").action(connectAction);
};
