import { deleteContext } from "../../modules/context/context.service.ts";

export const deleteAction = async (object: string, name: string) => {
  if (object === "context") {
    await deleteContext(name);
  }
};
