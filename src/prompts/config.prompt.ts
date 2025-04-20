import { rawlist } from "@inquirer/prompts";

export const selectDriverPrompt = async (drivers: string[]) => {
  const driverName = await rawlist({
    message: "Select a driver for this config",
    choices: drivers.map((d) => ({ name: d, value: d })),
  });

  return { driverName };
};
