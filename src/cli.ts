import { Command, Option } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { preAction } from "./pre-action/index.ts";
import { initializeCommands } from "./commands/index.ts";
import { startRepl } from "./repl/repl.ts";
import db from "./db/db.ts";
import { logAsDebug } from "./util/debug-logger.ts";
import { setConfig } from "./util/config.ts";

const cli = new Command();
cli
  .name("rrivctl")
  .description(packageJson.description)
  .option("--debug-mode <debugMode>")
  .addOption(
    new Option("--env <env>").choices(["local", "dev", "staging", "prod"]),
  )
  .version(packageJson.version, "-v, --version")
  .action(async (options) => {
    const { debugMode, env } = options;
    if (debugMode === "true" || debugMode === "false") {
      db.update((data) => {
        data.debugMode = debugMode === "true";
      });
      logAsDebug("debug mode updated successfully");
    } else if (debugMode) {
      throw new Error(
        "invalid value received for debugMode, only true or false allowed",
      );
    } else if (env) {
      await setConfig(env);
    } else {
      await startRepl(cli);
    }
  });

cli.hook("preAction", preAction);
cli.exitOverride();
initializeCommands(cli);

export default cli;
