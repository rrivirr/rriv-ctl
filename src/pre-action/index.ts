import { Command } from "commander";
import { errorHandler } from "../util/error-handler.ts";
import { authCheck } from "../util/auth-check.ts";
import { checkVersion } from "../util/check-version.ts";

export const preAction = async (
  thisCommand: Command,
  actionCommand: Command
) => {
  const commandName = actionCommand.name();
  try {
    if (commandName !== "update") {
      await checkVersion();
    }
    if (commandName === "rrivctl") {
      await authCheck();
      return;
    } else {
      if (
        commandName !== "update" &&
        commandName !== "whoami" &&
        actionCommand.parent?.name() !== "auth"
      ) {
        console.log("run 'rrivctl' to access the interactive shell");
        process.exit();
      }
      return;
    }
  } catch (error) {
    errorHandler({ error, exit: true });
  }
};
