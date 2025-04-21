#!/usr/bin/env node
import "dotenv/config";
import { Command } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { makeWatchCommand } from "./commands/watch.command.ts";
import { makeListCommand } from "./commands/list.command.ts";
import { makeGetCommand } from "./commands/get.command.ts";
import { makeRemoveCommand } from "./commands/remove.command.ts";
import { makeSetCommand } from "./commands/set.command.ts";
import { makeCalibrateCommand } from "./commands/calibrate.command.ts";
import { makeSerialCommand } from "./commands/serial.command.ts";
import { makeConnectCommand } from "./commands/connect.command.ts";
import { makeDebugCommand } from "./commands/debug.command.ts";
import { makeTestCommand } from "./commands/test.command.ts";
import { errorHandler } from "./util/error-handler.ts";
import { preAction } from "./pre-action/index.ts";
import { makeAuthCommand } from "./commands/auth.command.ts";
import { makeContextCommand } from "./commands/context.command.ts";
import { makeListLegacyCommand } from "./commands/list-legacy.command.ts";
import { makeEndCommand } from "./commands/end.command.ts";
import { makeSyncCommand } from "./commands/sync.command.ts";

let cli = new Command();

cli
  .name("rrivctl")
  .description(packageJson.description)
  .version(packageJson.version, "-v, --version")
  .option("-y", "continue with the default context");

cli.hook("preAction", preAction);
cli.exitOverride();

makeTestCommand(cli);
makeAuthCommand(cli);
makeEndCommand(cli);
makeWatchCommand(cli);
makeListCommand(cli);
makeListLegacyCommand(cli);
makeGetCommand(cli);
makeRemoveCommand(cli);
makeSetCommand(cli);
makeCalibrateCommand(cli);
makeSerialCommand(cli);
makeConnectCommand(cli);
makeSyncCommand(cli);
makeDebugCommand(cli);

cli
  .parseAsync()
  .then(() => {})
  .catch((error) => {
    errorHandler({ error, exit: true });
  });
