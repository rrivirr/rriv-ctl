import { checkVersion } from "../../util/check-version.ts";

export const updateAction = async () => {
  await checkVersion("command");
};
