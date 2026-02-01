#!/usr/bin/env node
import "dotenv/config";
import { errorHandler } from "./util/error-handler.ts";
import initAutoComplete from "./auto-complete.ts";
import { getAutoCompleteTree } from "./auto-complete-tree.ts";
import cli from "./cli.ts";

const tree = getAutoCompleteTree(cli);
const completion = initAutoComplete(tree);

if (process.argv.includes("setup-completion")) {
  completion.setupShellInitFile();
} else if (!process.argv.includes("--completion")) {
  cli
    .parseAsync()
    .then()
    .catch((error) => {
      errorHandler({ error, exit: true });
    });
}
