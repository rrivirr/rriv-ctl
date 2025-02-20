import { Command } from "commander";
import { initializeContext } from "./initialize-context.ts";
import { errorHandler } from "../util/error-handler.ts";
import { initializeDevice } from "./initialize-device.ts";
import { authUser } from "../util/auth-user.ts";
import db from "../db/db.ts";

export const preAction = async (
  thisCommand: Command,
  actionCommand: Command
) => {
  try {
    if (actionCommand.name() !== "test") {
      if (actionCommand.name() !== "auth") {
        await authUser(db);
        if (actionCommand.name() !== "context") {
          const useDefault = actionCommand.optsWithGlobals()?.y;
          await initializeContext(useDefault);
          if (actionCommand.name() !== "connect") {
            await initializeDevice();
          }
        }
      }
    }
  } catch (err) {
    errorHandler(err);
  }
};
