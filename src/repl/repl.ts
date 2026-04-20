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
    const sessionId = db.initializeSessionDb();

    const replServer = repl.start({
      ignoreUndefined: true,
      eval: getReplEvalFunction(cli),
      completer: getCompleter(cli),
      prompt: getPrompt(),
    });

    // removing default listener
    replServer.removeAllListeners("SIGINT");
    replServer.on("SIGINT", () => {
      if (process.listenerCount("SIGINT")) {
        process.emit("SIGINT");
        replServer.setPrompt(getPrompt());
        replServer.displayPrompt();
      }
    });

    replServer.on("exit", () => {
      db.resetDb(sessionId);
      console.log("Exiting RRIVCTL");
      process.exit();
    });
  });
};
