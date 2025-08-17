import { Command } from "commander";
import figlet from "figlet";
import repl, { REPLServer } from "repl";
import { Context } from "vm";
import db from "../db/db.ts";
import { bold } from "yoctocolors";
import { errorHandler } from "./error-handler.ts";

export const startRepl = (parentCommand: Command, actionCommand: Command) => {
  console.log(figlet.textSync("RRIV CTL"));

  const commandNamesToNotSupport = ["auth", "update", "connect"];
  const destructiveCommandNames = ["delete", "end", "use"];
  const commandNames = parentCommand.commands
    .map((c) => c.name())
    .filter((c) => !commandNamesToNotSupport.includes(c));

  console.log("Welcome to rriv ctl");
  console.log(
    bold(
      "left: name of current context | right: name assigned to device in the current context"
    )
  );
  console.log(
    "Running these commands will forcibly close the current session:",
    bold(destructiveCommandNames.join(" | ")),
    "\n"
  );

  function processCommand(replServer: REPLServer, args: string[]) {
    const commandName = args[0];
    switch (commandName) {
      case "help":
        console.log(commandNames.join(" | "), "\n");
        console.log(
          `to view details of each command enter ${bold("command -h")}`
        );
        break;

      default: {
        const commandToExecute = parentCommand.commands.find(
          (c) => c.name() === commandName
        );
        if (!commandToExecute) {
          // should not happen
          console.log("Unexpected error occurred");
          process.exit(1);
        }

        // reset
        (commandToExecute.parent as any)._lifeCycleHooks = {};
        (commandToExecute as any)._optionValues = {};

        parentCommand
          .parseAsync(args, { from: "user" })
          .then(() => {
            if (
              destructiveCommandNames.includes(commandName) ||
              (commandName === "auth" && args[1] === "logout")
            ) {
              console.log(
                `closing session due to ${bold(`${args[1] === "logout" ? "logout" : `${commandName}`}`)} command`
              );
              replServer.close();
            } else {
              replServer.displayPrompt();
            }
          })
          .catch((error) => {
            errorHandler({ error, exit: false });
            replServer.displayPrompt();
          });
        break;
      }
    }
  }

  function completer(line: string) {
    const completions = [...commandNames, "help", "exit"];
    const hits = completions.filter((c) => c.startsWith(line));
    return [hits.length ? hits : [], line];
  }

  function replEvalFunction(
    this: REPLServer,
    code: string,
    context: Context,
    replResourceName: string,
    callback: (err: Error | null, result: any) => void
  ) {
    const trimmedCode = code.trim();
    const args = trimmedCode.split(" ");
    if (args[0] === "rr" || args[0] === "rrivctl") {
      args.shift();
    }
    const commandName = args[0];
    if (trimmedCode === "exit") {
      this.close();
    } else if (
      commandNames.includes(commandName) ||
      trimmedCode === "help" ||
      commandName === "whoami" ||
      commandName === "logout"
    ) {
      if (commandName === "whoami" || commandName === "logout") {
        args.unshift("auth");
      }
      callback(null, processCommand(this, args));
    } else {
      console.log(
        `${trimmedCode} is not a valid command\ntype ${bold("help")} to view list of commands`
      );
      this.displayPrompt();
    }
  }

  return new Promise((_resolve) => {
    const {
      context: { name },
      deviceContext: { assignedDeviceName }, // @TODO or device unique name
    } = db.data;

    const replServer = repl.start({
      prompt: `${bold(`${name}:${assignedDeviceName} > `)}`,
      ignoreUndefined: true,
      eval: replEvalFunction,
      completer,
    });

    // reconstruct cli arguments/options
    const initCommandName = actionCommand.name();
    const initCommandOptions = actionCommand.opts();
    const initCommandArgs = actionCommand.args;

    const commandRawOptions = [];
    for (const [key, value] of Object.entries(initCommandOptions)) {
      commandRawOptions.push(`--${key}`);
      commandRawOptions.push(value);
    }

    processCommand(replServer, [
      initCommandName,
      ...initCommandArgs,
      ...commandRawOptions,
    ]);

    replServer.on("exit", () => {
      console.log("Exiting RRIVCTL");
      process.exit();
    });
  });
};
