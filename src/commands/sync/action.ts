import { syncCommands } from "../../modules/config/sync-commands.ts";
import { oraPromise } from "../../util/ora-promise.ts";

export const syncAction = async () => {
  await oraPromise(syncCommands);
};
