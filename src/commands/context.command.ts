import { Command } from "commander";
import db from "../db/db.ts";
import { pronounce } from "../util/console-log.ts";
import {
  createContext,
  deleteContext,
  getContextByName,
  getContexts,
} from "../api/context.ts";

export const makeContextCommand = (cli: Command) => {
  cli
    .command("context")
    .description("manage contexts")
    .option("-u, --use <context>", "switch to the specified context")
    .option("-d, --delete <context>", "delete the specified context")
    .option("-c, --create <context>", "create a new context")
    .action(async (options) => {
      const numOfKeys = Object.keys(options).length;
      if (numOfKeys > 1) {
        throw new Error("only one option should be specified");
      }
      if (!numOfKeys) {
        throw new Error("no option specified");
      }

      const accessToken = db.data.accessToken;

      if (options.use) {
        const contextToUse = options.use;
        const context = await getContextByName({
          contextName: contextToUse,
          accessToken,
        });
        if (!context) {
          throw new Error("context specified does not exist");
        }
        db.update((data) => {
          data.context = {
            id: context.id,
            name: context.name,
          };
        });
        console.log(`context successfully set to ${pronounce(context.name)}`);
      } else if (options.delete) {
        const contextToDelete = options.delete;
        const context = await getContextByName({
          contextName: contextToDelete,
          accessToken,
        });
        if (!context) {
          throw new Error("context specified does not exist");
        }
        await deleteContext({ id: context.id, accessToken });
        const { id: existingContextId } = db.data.context;
        console.log("context deleted successfully");
        if (existingContextId === context.id) {
          db.update((data) => {
            data.context = {
              id: "",
              name: "",
            };
          });
          console.log("no context currently set");
        }
      } else if (options.create) {
        await createContext({ accessToken, contextName: options.create });
        console.log("context created successfully");
      }

      process.exit();
    });
};
