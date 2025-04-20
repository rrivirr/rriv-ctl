import { Command } from "commander";
import { authenticateUser } from "../modules/auth/auth.service.ts";

export const makeAuthCommand = (cli: Command) => {
  cli
    .command("auth")
    .description("authenticate a user")
    .requiredOption("-u, --username <username>", "username to sign in with")
    .requiredOption("-p, --password <password>", "user password")
    .action(async (options) => {
      await authenticateUser(options);
      process.exit();
    });
};
