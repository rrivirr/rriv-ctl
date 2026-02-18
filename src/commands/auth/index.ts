import { Command } from "commander";
import {
  loginAction,
  logoutAction,
  signupAction,
  verifyAction,
  whoamiAction,
  resetPasswordAction,
} from "./action.ts";

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
    .command("signup")
    .description("create a new user account")
    .option("-e, --email <email>")
    .option("-f, --first-name <firstName>")
    .option("-l, --last-name <lastName>")
    .action(signupAction);

  authCommand
    .command("verify")
    .description("initiate account verification")
    .argument("<email>")
    .action(verifyAction);

  authCommand
    .command("reset-password")
    .description("account recovery")
    .argument("<email>")
    .action(resetPasswordAction);

  authCommand
    .command("whoami")
    .description("get logged in user, unsupported in the interactive shell")
    .action(whoamiAction);
};
