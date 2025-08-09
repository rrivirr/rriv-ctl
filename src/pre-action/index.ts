import { Command } from "commander";
import { initializeContext } from "./initialize-context.ts";
import { errorHandler } from "../util/error-handler.ts";
import { initializeDevice } from "./initialize-device.ts";
import { authUser } from "../util/auth-user.ts";
import { syncCommands } from "../modules/config/sync-commands.ts";

export const preAction = async (
  thisCommand: Command,
  actionCommand: Command
) => {
  const commandName = actionCommand.name();
  try {
    if (commandName !== "test") {
      if (commandName !== "auth") {
        await authUser();
        if (commandName !== "sync") {
          await syncCommands("preAction");
        }
        const args = actionCommand.args;
        if (
          !(
            (commandName === "use" && args[0] === "context") ||
            (commandName === "create" && args[0] === "context") ||
            commandName === "sync"
          )
        ) {
          const useDefault = actionCommand.optsWithGlobals()?.y;
          await initializeContext(useDefault);
          if (commandName !== "connect") {
            await initializeDevice();
          }
        }
      }
    }
  } catch (error) {
    errorHandler({ error, exit: true });
  }
};
