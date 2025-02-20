import { input } from "@inquirer/prompts";

export const assignedDeviceNamePrompt = async () => {
  const assignedDeviceName = await input({
    message: "Assign a name for this device in the current context:",
    validate: (v) =>
      v.trim().length >= 3 ? true : "value must have at least 3 letters",
  });

  return { assignedDeviceName };
};
