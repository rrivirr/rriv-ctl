import { Command } from "commander";
import { authAction } from "./action.ts";

export const makeAuthCommand = (cli: Command) => {
  cli
    .command("auth")
    .description("authenticate a user")
    .requiredOption("-u, --username <username>", "username to sign in with")
    .action(authAction);
};
