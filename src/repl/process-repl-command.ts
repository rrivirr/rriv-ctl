import { Command } from "commander";
import { REPLServer } from "repl";
import { getPrompt } from "./utils.ts";
import { errorHandler } from "../util/error-handler.ts";
import { runChecks } from "../pre-action/run-checks.ts";

export async function processReplCommand(
  replServer: REPLServer,
  args: string[],
  command: Command
) {
  const commandName = args[0];
  if (commandName === "help") {
    command
      .parseAsync(["rrivctl", "-h"], {
        from: "user",
      })
      .then(() => {
        replServer.setPrompt(getPrompt());
        replServer.displayPrompt();
      })
      .catch((error) => {
        errorHandler({ error, exit: false });
        replServer.setPrompt(getPrompt());
        replServer.displayPrompt();
      });
  } else {
    const commandToExecute = command.commands.find(
      (c) => c.name() === commandName
    );
    if (!commandToExecute) {
      // should not happen
      console.log("Unexpected error occurred");
      process.exit(1);
    }

    // reset hack
    (commandToExecute.parent as any)._lifeCycleHooks = {};
    (commandToExecute as any)._optionValues = {};

    try {
      const valid = await runChecks({
        commandName,
        commandArgument: args[1],
        replServer,
      });
      if (!valid) {
        return;
      }
    } catch (error) {
      errorHandler({ error, exit: false });
      replServer.setPrompt(getPrompt());
      replServer.displayPrompt();
    }

    replServer.setPrompt("");
    command
      .parseAsync(args, { from: "user" })
      .then(() => {
        replServer.setPrompt(getPrompt());
        replServer.displayPrompt();
      })
      .catch((error) => {
        errorHandler({ error, exit: false });
        replServer.setPrompt(getPrompt());
        replServer.displayPrompt();
      });
  }
}
