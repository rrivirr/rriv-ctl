#!/usr/bin/env node
import { Command } from "commander";
import { description, version } from "../package.json";
import { makeWatchCommand } from "./commands/watch.command";
import { makeListCommand } from "./commands/list.command";
import { makeGetCommand } from "./commands/get.command";
import { makeRemoveCommand } from "./commands/remove.command";
import { makeSetCommand } from "./commands/set.command";
import { makeCalibrateCommand } from "./commands/calibrate.command";
import { makeSerialCommand } from "./commands/serial.command";
import { makeConnectCommand } from "./commands/connect.command";
import { makeDebugCommand } from "./commands/debug.command";
import { makeTestCommand } from "./commands/test.command";

let cli = new Command();

cli.name("rrivctl").description(description).version(version, "-v, --version");

makeTestCommand(cli);
makeWatchCommand(cli);
makeListCommand(cli);
makeGetCommand(cli);
makeRemoveCommand(cli);
makeSetCommand(cli);
makeCalibrateCommand(cli);
makeSerialCommand(cli);
makeConnectCommand(cli);
makeDebugCommand(cli);

cli.parse(process.argv);
