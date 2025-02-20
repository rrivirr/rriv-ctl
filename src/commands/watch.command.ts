import { Command } from "commander";
import moment from "moment";
import { getSerialPathFromCache } from "../util/get-serial-path-from-cache.ts";
import { readSerialUntilQuit } from "../util/read-serial-until-quit.ts";

export const makeWatchCommand = (cli: Command) => {
  cli
    .command("watch")
    .description("watch data output and log to a file")
    .option("-d, --debug", "enabled debuggin output", false)
    .option("-f, --file <file>", "name of a file to output sensor data to")
    .option("-p, --path <serial_path>", "serial path of the RRIV device")
    .option("--project <project>", "a project name for organizing watch files")
    .action((options) => {
      let project = options.project ?? "rriv";
      let file =
        options.file ??
        project + "_" + moment().format("YYYY-MM-DDTHH:mm") + "_watch.txt";
      let debug = options.debug;

      let serialPortPath = options.path ?? getSerialPathFromCache();

      readSerialUntilQuit(serialPortPath, file, debug);
    });
};
