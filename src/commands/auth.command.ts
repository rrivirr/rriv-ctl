import { Command } from "commander";
import { authUserApiCall } from "../api/keycloak.ts";
import db from "../db/db.ts";

export const makeAuthCommand = (cli: Command) => {
  cli
    .command("auth")
    .description("authenticate a user")
    .requiredOption("-u, --username <username>", "username to sign in with")
    .requiredOption("-p, --password <password>", "user password")
    .action(async (options) => {
      const { username, password } = options;
      const { accessToken, expiresIn } = await authUserApiCall({
        username,
        password,
      });
      const now = new Date();

      db.update((data) => {
        data.accessToken = accessToken;
        data.expirationTime = +now.setSeconds(now.getSeconds() + expiresIn);
      });

      console.log("authentication successful");
      process.exit();
    });
};
