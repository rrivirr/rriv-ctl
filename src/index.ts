#!/usr/bin/env node
import "dotenv/config";
import { Command } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { errorHandler } from "./util/error-handler.ts";
import { preAction } from "./pre-action/index.ts";
import { initializeCommands } from "./commands/index.ts";

const cli = new Command();
cli
  .name("rrivctl")
  .description(packageJson.description)
  .version(packageJson.version, "-v, --version")
  .option("-y", "continue with the default context");
cli.hook("preAction", preAction);
cli.exitOverride();

initializeCommands(cli).then(() => {
  cli
    .parseAsync()
    .then()
    .catch((error) => {
      errorHandler({ error, exit: true });
    });
});
