import { Command } from "commander";
import { logoutAction } from "./action.ts";

export const makeLogoutCommand = (cli: Command) => {
  cli
    .command("logout")
    .description("exit current session")
    .action(logoutAction);
};
