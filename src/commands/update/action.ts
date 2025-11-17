import { updateRrivctl } from "../../modules/update/update.service.ts";

export const updateAction = async (tag: string, options: any) => {
  if (tag) {
    const firstLetter = tag[0];
    if (firstLetter !== "v") {
      throw new Error("tags start with a v");
    }
  }

  const { channel } = options;

  await updateRrivctl(tag, channel);
};
