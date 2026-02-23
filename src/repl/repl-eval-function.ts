import { REPLServer } from "repl";
import { Context } from "vm";
import { getLicense, getWarranty } from "./get-startup-Information.ts";
import { bold } from "yoctocolors";
import { getCommandNames } from "./utils.ts";
import { Command } from "commander";
import { processReplCommand } from "./process-repl-command.ts";

export function getReplEvalFunction(cli: Command) {
  return async function (
    this: REPLServer,
    code: string,
    context: Context,
    replResourceName: string,
    callback: (err: Error | null, result: any) => void,
  ) {
    const commandNames = getCommandNames(cli);
    const trimmedCode = code.trim();
    const args = trimmedCode.split(" ");
    if (args[0] === "rr" || args[0] === "rrivctl") {
      args.shift();
    }
    const commandName = args[0];
    if (trimmedCode === "exit") {
      this.close();
    } else if (trimmedCode === "") {
      this.displayPrompt();
    } else if (trimmedCode === "show-conditions") {
      console.log(getLicense());
      this.displayPrompt();
    } else if (trimmedCode === "show-warranty") {
      console.log(getWarranty());
      this.displayPrompt();
    } else if (commandNames.includes(commandName) || trimmedCode === "help") {
      callback(null, await processReplCommand(this, args, cli));
    } else {
      console.log(
        `${trimmedCode} is not a valid or supported command\ntype ${bold("help")} to view list of commands`,
      );
      this.displayPrompt();
    }
  };
}
