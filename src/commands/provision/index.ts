import { Command } from "commander";
import { provisionAction } from "./action.ts";

export const makeProvisionCommand = (cli: Command) => {
  const porvisionCommand = cli.command("provision");

  porvisionCommand.command("device").action(provisionAction);
};
