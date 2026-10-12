import { Command } from "commander";
import { loginAction, logoutAction, whoamiAction } from "./action.ts";

export const makeAuthCommand = (cli: Command) => {
  const authCommand = cli
    .command("auth")
    .description("auth related commands, unsupported in the interactive shell");

  authCommand
    .command("login")
    .description("authenticate a user")
    .argument("[email]", "email to sign in with")
    .action(loginAction);

  authCommand
    .command("logout")
    .description("exit current session")
    .action(logoutAction);

  authCommand
    .command("whoami")
    .description("get logged in user, unsupported in the interactive shell")
    .action(whoamiAction);
};
