import { createContext } from "../../modules/context/context.service.ts";

export const createAction = async (object: string, options: any) => {
  if (object === "context") {
    if (!options.name) {
      console.log("name flag is required");
      return;
    }
    await createContext(options);
  }
};
