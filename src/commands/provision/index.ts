import { Command } from "commander";
import { provisionAction, registerEuiAction } from "./action.ts";

export const makeProvisionCommand = (cli: Command) => {
  const porvisionCommand = cli.command("provision");

  porvisionCommand.command("device").action(provisionAction);
  porvisionCommand.command("telemeter").action(registerEuiAction);
};
