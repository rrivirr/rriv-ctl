import { logToConsole } from "../../util/console-log.ts";
import { useContext } from "../../modules/context/context.service.ts";

export const useAction = async (object: string, options: any) => {
  if (object === "context") {
    if (!options.name) {
      logToConsole("name flag is required");
      return;
    }
    await useContext(options);
  }
};
