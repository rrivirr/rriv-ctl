import { Command } from "commander";
import { bold } from "yoctocolors";
import { getLoggedInUser } from "../util/get-logged-in-user.ts";
import { getAutoCompleteTree } from "../auto-complete-tree.ts";

export const getCommandNames = (cli: Command) => {
  const commandNamesToNotSupport = ["auth", "update"];

  const commandNames = cli.commands
    .map((c) => c.name())
    .filter((c) => !commandNamesToNotSupport.includes(c));

  return commandNames;
};

export const getCompleter = (cli: Command) => (line: string) => {
  const tree = getAutoCompleteTree(cli);
  tree["exit"] = [];
  const firstLevelCommands = [...Object.keys(tree)];

  const lines = line.split(" ").filter((l) => l);
  const numOfWords = lines.length;

  if (!numOfWords) {
    return [firstLevelCommands, line];
  }

  if (line.includes("-h")) {
    return [[line.split("-h")[0]], line];
  }

  let hits: string[] = [];
  let commands = [...firstLevelCommands];
  let childTree = { ...tree };
  const nhits: string[] = [];

  for (const word of lines) {
    hits = commands.filter((c) => c.startsWith(word));
    if (hits.length === 1) {
      const key = hits[0];
      nhits.push(key);
      if (word !== key) {
        break;
      }
      const newChildTree = childTree[key];

      commands = newChildTree.length ? ["-h"] : Object.keys(newChildTree);
      childTree = newChildTree;
      hits = commands;

      if (newChildTree.length) {
        break;
      }
    }
  }

  if (nhits.length) {
    // parent commands
    if (nhits.at(-1) === hits[0]) {
      hits = [`${nhits.join(" ")}`];
    } else {
      if (hits.length === 1) {
        hits = [`${nhits.join(" ")} ${hits[0]}`];
      } else {
        hits = hits.map((h) => `${nhits.join(" ")} ${h}`);
      }
    }
  }

  return [hits, line];
};

export const getPrompt = () => {
  const user = getLoggedInUser();
  let prompt = `rrivctl > `;

  if (user) {
    const {
      context: { name },
      deviceContext: { assignedDeviceName },
    } = user;
    if (name) {
      if (assignedDeviceName) {
        prompt = `${name}:${assignedDeviceName} > `;
      } else {
        prompt = `${name} > `;
      }
    }
  }

  return bold(prompt);
};
