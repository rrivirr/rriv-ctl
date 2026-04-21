import { saveCurrentSnapshot } from "../../modules/config/config-snapshot.service.ts";
import { oraPromise } from "../../util/ora-promise.ts";

export const saveAction = async (object: string, options: any) => {
  if (object === "config-snapshot") {
    await oraPromise(() => saveCurrentSnapshot({ name: options.name }));
  }
};
