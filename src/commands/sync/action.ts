import { syncCommands } from "../../modules/config/sync-commands.ts";

export const syncAction = async () => {
  await syncCommands("command");
};
