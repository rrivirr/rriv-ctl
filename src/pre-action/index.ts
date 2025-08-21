import { Command } from "commander";
import { errorHandler } from "../util/error-handler.ts";
import { authUser } from "../util/auth-user.ts";
import { checkVersion } from "../util/check-version.ts";

export const preAction = async (
  thisCommand: Command,
  actionCommand: Command
) => {
  const commandName = actionCommand.name();
  try {
    await checkVersion();
    if (commandName === "rrivctl") {
      await authUser();
      return;
    } else {
      if (
        commandName !== "login" &&
        commandName !== "signup" &&
        commandName !== "update"
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
