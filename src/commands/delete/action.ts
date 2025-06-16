import { logToConsole } from "../../util/console-log.ts";
import { deleteContext } from "../../modules/context/context.service.ts";

export const deleteAction = async (object: string, options: any) => {
  if (object === "context") {
    if (!options.name) {
      logToConsole("name flag is required");
      return;
    }
    await deleteContext(options);
  }
};
