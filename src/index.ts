#!/usr/bin/env node
import "dotenv/config";
import "./instrument.mjs";
import path from "node:path";
import { readFileSync } from "node:fs";
import packageJson from "../package.json" with { type: "json" };
import { errorHandler } from "./util/error-handler.ts";
import initAutoComplete from "./auto-complete.ts";
import { getAutoCompleteTree } from "./auto-complete-tree.ts";
import cli from "./cli.ts";
import db from "./db/db.ts";
import { logAsDebug } from "./util/debug-logger.ts";
import * as Sentry from "@sentry/node";

Sentry.setTag("version", packageJson.version);
Sentry.setTag("command", JSON.stringify(process.argv));

const tree = getAutoCompleteTree(cli);
const completion = initAutoComplete(tree);

const setupAutoComplete = () => {
  const { autoCompleteSetup } = db.data;
  if (!autoCompleteSetup) {
    const shell = process.env.SHELL!;
    let configFilePath = ``;

    if (shell.match(/bash/)) {
      configFilePath = path.join(process.env.HOME!, ".bashrc");
    } else if (shell.match(/zsh/)) {
      configFilePath = path.join(process.env.HOME!, ".zshrc");
    }

    if (configFilePath) {
      const configData = readFileSync(configFilePath, "utf-8");
      if (configData.includes("begin rrivctlv2 completion")) {
        db.update((data) => {
          data.autoCompleteSetup = true;
        });
      } else {
        completion.setupShellInitFile(); // calls process.exit
      }
    } else {
      logAsDebug(process.env.SHELL, " found");
    }
  }
};

if (!process.argv.includes("--completion")) {
  cli
    .parseAsync()
    .then(setupAutoComplete)
    .catch((error) => {
      errorHandler({ error, exit: true });
    });
}
