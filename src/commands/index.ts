import { Command } from "commander";
import { readdirSync } from "fs";

export const initializeCommands = async (cli: Command) => {
  const directoryPath = "./src/commands";
  const files = readdirSync(directoryPath);
  for (const file of files) {
    if (file === "index.ts") continue;
    const command = await import(`./${file}/index.ts`);
    command[Object.keys(command)[0]](cli);
  }
};
