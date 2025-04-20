import { Command } from "commander";
import { syncCommands } from "../util/sync-commands.ts";

export const makeSyncCommand = (cli: Command) => {
  cli
    .command("sync")
    .description("sync previous commands")
    .action(async (options) => {
      await syncCommands("command");
      process.exit();
    });
};
