import { createContext } from "../../modules/context/context.service.ts";

export const createAction = async (object: string, options: any) => {
  if (object === "context") {
    if (!options.name) {
      throw new Error("name flag is required");
    }
    await createContext(options);
  }
};
