#!/usr/bin/env node
import "dotenv/config";
import { errorHandler } from "./util/error-handler.ts";
import initAutoComplete from "./auto-complete.ts";
import { getAutoCompleteTree } from "./auto-complete-tree.ts";
import cli from "./cli.ts";
import db from "./db/db.ts";

const tree = getAutoCompleteTree(cli);
const completion = initAutoComplete(tree);

const { autoCompleteSetup } = db.data;
const setupAutoComplete = () => {
  if (!autoCompleteSetup) {
    db.update((data) => {
      data.autoCompleteSetup = true;
    });
    completion.setupShellInitFile(); // calls process.exit
  } else {
    console.log("running");
  }
};

if (process.argv.includes("--setup-completion")) {
  setupAutoComplete();
} else if (!process.argv.includes("--completion")) {
  cli
    .parseAsync()
    .then(setupAutoComplete)
    .catch((error) => {
      errorHandler({ error, exit: autoCompleteSetup });
      setupAutoComplete();
    });
}
