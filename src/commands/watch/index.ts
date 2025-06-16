import { Command } from "commander";
import { watchAction } from "./action.ts";

export const makeWatchCommand = (cli: Command) => {
  cli
    .command("watch")
    .description("watch data output and log to a file")
    .option("-d, --debug", "enabled debuggin output", false)
    .option("-f, --file <file>", "name of a file to output sensor data to")
    .option("-p, --path <serial_path>", "serial path of the RRIV device")
    .option("--project <project>", "a project name for organizing watch files")
    .action(watchAction);
};
