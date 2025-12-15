import { Command } from "commander";
import repl from "repl";
import {
  getInitialText,
  getUserInformation,
} from "./get-startup-Information.ts";
import { getReplEvalFunction } from "./repl-eval-function.ts";
import { getCompleter, getPrompt } from "./utils.ts";
import db from "../db/db.ts";

export const startRepl = (cli: Command) => {
  console.log(getInitialText());
  console.log(getUserInformation());

  return new Promise((_resolve) => {
    const replServer = repl.start({
      ignoreUndefined: true,
      eval: getReplEvalFunction(cli),
      completer: getCompleter(cli),
      prompt: getPrompt(),
    });

    replServer.removeAllListeners("SIGINT");
    replServer.on("SIGINT", () => {
      const { replSigIntFunctions } = db.data;
      if (replSigIntFunctions?.length) {
        const sigIntFunctions = [...replSigIntFunctions];
        for (const func of replSigIntFunctions) {
          // func is null if called outside of repl
          if (func) {
            func();
          }
          sigIntFunctions.shift();
        }
        db.update((data) => {
          data.replSigIntFunctions = sigIntFunctions;
        });
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
