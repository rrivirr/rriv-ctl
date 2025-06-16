import { Command } from "commander";
import { debugAction } from "./action.ts";

export const makeDebugCommand = (cli: Command) => {
  cli.command("debug").action(debugAction);
};
