import { syncCommands } from "../../util/sync-commands.ts";

export const syncAction = async () => {
  await syncCommands("command");
  process.exit();
};
