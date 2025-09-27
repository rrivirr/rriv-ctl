import { Command } from "commander";
import { errorHandler } from "../util/error-handler.ts";
import { authCheck } from "../util/auth-check.ts";
import { runChecks } from "./run-checks.ts";

export const preAction = async (
  thisCommand: Command,
  actionCommand: Command
) => {
  const commandName = actionCommand.name();
  const args = actionCommand.args;

  try {
    // @TODO update functionality of update command as well as checkVersion function
    // if (commandName !== "update") {
    // await checkVersion();
    // }

    if (
      !(actionCommand.parent?.name() === "auth" || commandName === "whoami")
    ) {
      await authCheck();
      if (commandName !== "rrivctl") {
        const valid = await runChecks({
          commandName,
          commandArgument: args[0],
        });
        if (!valid) {
          process.exit();
        }
      }
    }
  } catch (error) {
    errorHandler({ error, exit: true });
  }
};
