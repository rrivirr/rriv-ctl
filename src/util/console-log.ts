import { bold, cyan, underline } from "yoctocolors";

export const pronounce = (phrase: string) => {
  return underline(cyan(bold(`${phrase}`)));
};
