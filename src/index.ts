#!/usr/bin/env node
import "dotenv/config";
import { Command } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { makeWatchCommand } from "./commands/watch/index.ts";
import { makeListCommand } from "./commands/list/index.ts";
import { makeGetCommand } from "./commands/get/index.ts";
import { makeRemoveCommand } from "./commands/remove/index.ts";
import { makeSetCommand } from "./commands/set/index.ts";
import { makeCalibrateCommand } from "./commands/calibrate/index.ts";
import { makeSerialCommand } from "./commands/serial/index.ts";
import { makeConnectCommand } from "./commands/connect/index.ts";
import { makeDebugCommand } from "./commands/debug/index.ts";
import { makeTestCommand } from "./commands/test/index.ts";
import { errorHandler } from "./util/error-handler.ts";
import { preAction } from "./pre-action/index.ts";
import { makeAuthCommand } from "./commands/auth/index.ts";
import { makeListLegacyCommand } from "./commands/list-legacy/index.ts";
import { makeEndCommand } from "./commands/end/index.ts";
import { makeSyncCommand } from "./commands/sync/index.ts";
import { makeSaveCommand } from "./commands/save/index.ts";
import { makeUseCommand } from "./commands/use/index.ts";
import { makeCreateCommand } from "./commands/create/index.ts";
import { makeDeleteCommand } from "./commands/delete/index.ts";
import { makePublishCommand } from "./commands/publish/index.ts";
import { makeApplyCommand } from "./commands/apply/index.ts";

const cli = new Command();

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
makePublishCommand(cli);
makeApplyCommand(cli);
makeSaveCommand(cli);
makeCalibrateCommand(cli);
makeSerialCommand(cli);
makeConnectCommand(cli);
makeSyncCommand(cli);
makeCreateCommand(cli);
makeDeleteCommand(cli);
makeUseCommand(cli);
makeDebugCommand(cli);

cli
  .parseAsync()
  .then()
  .catch((error) => {
    errorHandler({ error, exit: true });
  });
