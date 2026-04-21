import { Command, Option } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { preAction } from "./pre-action/index.ts";
import { initializeCommands } from "./commands/index.ts";
import { startRepl } from "./repl/repl.ts";
import db from "./db/db.ts";
import { logAsDebug } from "./util/debug-logger.ts";
import { setConfig } from "./util/config.ts";
import { spinners } from "ora";

const cli = new Command();
cli
  .name("rrivctl")
  .description(packageJson.description)
  .option("--debug-mode <debugMode>")
  .option("--spinner <spinner>")
  .addOption(
    new Option("--env <env>").choices(["local", "dev", "staging", "prod"]),
  )
  .version(packageJson.version, "-v, --version")
  .action(async (options) => {
    const { debugMode, env, spinner } = options;
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
    } else if (spinner) {
      if (!(spinners as any)[spinner]) {
        console.log(
          "invalid spinner received, view spinners at https://github.com/sindresorhus/cli-spinners/blob/main/spinners.json",
        );
        return;
      }
      db.update((data) => {
        data.spinner = spinner;
      });
    } else {
      await startRepl(cli);
    }
  });

cli.hook("preAction", preAction);
cli.exitOverride();
initializeCommands(cli);

export default cli;
