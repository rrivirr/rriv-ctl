import { Command } from "commander";
import {
  loginAction,
  logoutAction,
  signupAction,
  whoamiAction,
} from "./action.ts";

export const makeAuthCommand = (cli: Command) => {
  const authCommand = cli.command("auth").description("auth related commands");

  authCommand
    .command("login")
    .description("authenticate a user")
    .argument("<email>", "email to sign in with")
    .action(loginAction);

  authCommand
    .command("logout")
    .description("exit current session")
    .action(logoutAction);

  authCommand
    .command("signup")
    .description("create a new user account")
    .option("-e, --email <email>")
    .option("-f, --firstName <firstName>")
    .option("-l, --lastName <lastName>")
    .option("-p, --phone <phone>")
    .action(signupAction);

  authCommand
    .command("whoami")
    .description("get logged in user")
    .action(whoamiAction);
};
