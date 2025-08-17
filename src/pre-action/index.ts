import { Command } from "commander";
import { initializeContext } from "./initialize-context.ts";
import { errorHandler } from "../util/error-handler.ts";
import { initializeDevice } from "./initialize-device.ts";
import { authUser } from "../util/auth-user.ts";
import { syncCommands } from "../modules/config/sync-commands.ts";
import { checkVersion } from "../util/check-version.ts";
import { startRepl } from "../util/repl.ts";

export const preAction = async (
  thisCommand: Command,
  actionCommand: Command
) => {
  const commandName = actionCommand.name();
  try {
    await checkVersion();
    if (
      !["login", "test", "signup", "whoami", "logout", "update"].includes(
        commandName
      )
    ) {
      await authUser();
      if (commandName !== "sync") {
        await syncCommands("preAction");
      }
      const args = actionCommand.args;
      if (
        !(
          (commandName === "use" && args[0] === "context") ||
          (commandName === "create" && args[0] === "context") ||
          (commandName === "list" && args[0] === "context") ||
          (commandName === "end" && args[0] === "context") ||
          (commandName === "delete" && args[0] === "context") ||
          (commandName === "get" && args[0] === "data") ||
          commandName === "logout" ||
          commandName === "sync"
        )
      ) {
        const useDefault = actionCommand.optsWithGlobals()?.y;
        await initializeContext(useDefault);
        if (commandName !== "connect") {
          await initializeDevice();
          await startRepl(thisCommand, actionCommand);
        }
      }
    }
  } catch (error) {
    errorHandler({ error, exit: true });
  }
};
