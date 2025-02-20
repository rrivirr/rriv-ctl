import { input } from "@inquirer/prompts";

export const bindDevicePrompt = async () => {
  const uniqueName = await input({
    message: "Enter a unique name for this device",
    validate: (v) =>
      v.trim().length >= 3 ? true : "value must have at least 3 letters",
  });

  return { uniqueName };
};
