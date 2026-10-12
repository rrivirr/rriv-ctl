import {
  listContexts,
  useContext,
} from "../../modules/context/context.service.ts";
import { oraPromise } from "../../util/ora-promise.ts";

export const useAction = async (name: string) => {
  await oraPromise(() => useContext(name));
};

export const listContextAction = async (options: any) => {
  await oraPromise(() => listContexts(options));
};
