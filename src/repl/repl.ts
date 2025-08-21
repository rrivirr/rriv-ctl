import { Command } from "commander";
import repl from "repl";
import { getStartUpInformation } from "./get-startup-Information.ts";
import { getReplEvalFunction } from "./repl-eval-function.ts";
import { getCompleter, getPrompt } from "./utils.ts";

export const startRepl = (command: Command) => {
  console.log(getStartUpInformation());

  return new Promise((_resolve) => {
    const replServer = repl.start({
      ignoreUndefined: true,
      eval: getReplEvalFunction(command),
      completer: getCompleter(command),
      prompt: getPrompt(),
    });

    replServer.on("exit", () => {
      console.log("Exiting RRIVCTL");
      process.exit();
    });
  });
};
