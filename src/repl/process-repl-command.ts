import { Command } from "commander";
import { REPLServer } from "repl";
import { getPrompt } from "./utils.ts";
import { errorHandler } from "../util/error-handler.ts";
import { runChecks } from "../pre-action/run-checks.ts";

export async function processReplCommand(
  replServer: REPLServer,
  args: string[],
  cli: Command
) {
  const commandName = args[0];
  if (commandName === "help") {
    cli
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
    const commandToExecute = cli.commands.find((c) => c.name() === commandName);
    if (!commandToExecute) {
      // should not happen
      console.log("Unexpected error occurred");
      process.exit(1);
    }

    // reset hack
    (commandToExecute.parent as any)._lifeCycleHooks = {};
    (commandToExecute as any)._optionValues = {};

    if (
      !(
        (commandName === "list" &&
          args[1] === "device" &&
          (args[2] === "--all" || args[2] === "-a")) ||
        (commandName === "provision" && args[1] === "device") ||
        (commandName === "probe" && args[1] === "debug")
      )
    ) {
      try {
        await runChecks({
          commandName,
          commandArgument: args[1],
          replServer,
        });
      } catch (error) {
        errorHandler({ error, exit: false });
        replServer.setPrompt(getPrompt());
        replServer.displayPrompt();
        return;
      }
    }

    replServer.setPrompt(""); // so prompt doesn't show if command logs numerous lines
    cli
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
