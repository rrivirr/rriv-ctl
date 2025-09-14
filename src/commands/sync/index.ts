import { Command } from "commander";
import { syncAction } from "./action.ts";

export const makeSyncCommand = (cli: Command) => {
  cli.command("sync").description("sync previous commands").action(syncAction);
};
