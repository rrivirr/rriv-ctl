import { Command } from "commander";
import { errorHandler } from "../util/error-handler.ts";
import { authCheck } from "../util/auth-check.ts";
import { runChecks } from "./run-checks.ts";
import { checkVersionAndUpdate } from "../modules/update/update.service.ts";

export const preAction = async (
  thisCommand: Command,
  actionCommand: Command
) => {
  const commandName = actionCommand.name();
  const args = actionCommand.args;
  const options = actionCommand.opts();

  if (args.length && commandName === "rrivctl") {
    console.log("invalid command received");
    process.exit();
  }

  try {
    if (commandName !== "update") {
      await checkVersionAndUpdate();
    }

    if (
      !(
        actionCommand.parent?.name() === "auth" ||
        commandName === "whoami" ||
        commandName === "update" ||
        options.env ||
        options.debugMode
      )
    ) {
      await authCheck();
      if (
        !(
          commandName === "rrivctl" ||
          (commandName === "list" && args[0] === "device" && options.all) ||
          (commandName === "device" &&
            actionCommand.parent?.name() === "provision")
        )
      ) {
        await runChecks({
          commandName,
          commandArgument: args[0],
        });
      }
    }
  } catch (error) {
    errorHandler({ error, exit: true });
  }
};
