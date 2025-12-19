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
  const commandParentName = actionCommand.parent?.name();

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
        commandParentName === "auth" ||
        commandName === "test" ||
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
          (commandName === "device" && commandParentName === "provision") ||
          (commandName === "debug" && commandParentName === "probe") ||
          commandParentName === "history"
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
