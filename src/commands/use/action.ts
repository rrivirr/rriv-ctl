import { useContext } from "../../modules/context/context.service.ts";

export const useAction = async (object: string, name: string) => {
  if (object === "context") {
    await useContext(name);
  }
};
