import { updateRrivcli } from "../../modules/update/update.service.ts";

export const updateAction = async (tag: string, options: any) => {
  if (tag) {
    const firstLetter = tag[0];
    if (firstLetter !== "v") {
      console.log("tags start with a v");
      return;
    }
  }

  const { channel } = options;

  await updateRrivcli(tag, channel);
};
