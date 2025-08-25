import { Command } from "commander";
import repl from "repl";
import { getStartUpInformation } from "./get-startup-Information.ts";
import { getReplEvalFunction } from "./repl-eval-function.ts";
import { getCompleter, getPrompt } from "./utils.ts";
import db from "../db/db.ts";

export const startRepl = (command: Command) => {
  console.log(getStartUpInformation());

  return new Promise((_resolve) => {
    const replServer = repl.start({
      ignoreUndefined: true,
      eval: getReplEvalFunction(command),
      completer: getCompleter(command),
      prompt: getPrompt(),
    });

    replServer.removeAllListeners("SIGINT");
    replServer.on("SIGINT", () => {
      const { replSigIntFunctions } = db.data;
      if (replSigIntFunctions?.length) {
        const sigIntFunctions = [...replSigIntFunctions];
        for (const [index, func] of replSigIntFunctions.entries()) {
          func();
          sigIntFunctions.splice(index, 1);
          db.update((data) => {
            data.replSigIntFunctions = sigIntFunctions;
          });
        }
        replServer.setPrompt(getPrompt());
        replServer.displayPrompt();
      } else {
        replServer.close();
      }
    });

    replServer.on("exit", () => {
      console.log("Exiting RRIVCTL");
      process.exit();
    });
  });
};
