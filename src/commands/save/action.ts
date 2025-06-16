import { saveCurrentSnapshot } from "../../modules/config/config-snapshot.service.ts";

export const saveAction = async (object: string, options: any) => {
  if (object === "config-snapshot") {
    await saveCurrentSnapshot({ name: options.name });
  }
};
