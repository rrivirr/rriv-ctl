import { Command } from "commander";
import { bold } from "yoctocolors";
import db from "../db/db.ts";

export const extraSupportedCommands = ["exit", "whoami", "logout"];

export const getCommandNames = (command: Command) => {
  const commandNamesToNotSupport = ["auth", "update"];

  const commandNames = command.commands
    .map((c) => c.name())
    .filter((c) => !commandNamesToNotSupport.includes(c));

  return commandNames;
};

export const getCompleter = (command: Command) => (line: string) => {
  const commandNames = getCommandNames(command);
  const completions = [...commandNames, ...extraSupportedCommands, "help"];
  const hits = completions.filter((c) => c.startsWith(line));
  return [hits.length ? hits : [], line];
};

export const getPrompt = () => {
  const {
    context: { name },
    deviceContext: { assignedDeviceName },
  } = db.data;
  let prompt;

  if (name) {
    if (assignedDeviceName) {
      prompt = `${name}:${assignedDeviceName} > `;
    } else {
      prompt = `${name} > `;
    }
  } else {
    prompt = `rrivctl > `;
  }
  return bold(prompt);
};
