import { Command } from "commander";
import { signupAction } from "./action.ts";

export const makeSignupCommand = (cli: Command) => {
  cli
    .command("signup")
    .description("create a new user account")
    .option("-e, --email <email>")
    .option("-f, --firstName <firstName>")
    .option("-l, --lastName <lastName>")
    .option("-p, --phone <phone>")
    .action(signupAction);
};
