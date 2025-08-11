import { Command } from "commander";
import { authAction } from "./action.ts";

export const makeAuthCommand = (cli: Command) => {
  cli
    .command("auth")
    .description("authenticate a user")
    .requiredOption("-e, --email <email>", "email to sign in with")
    .action(authAction);
};
