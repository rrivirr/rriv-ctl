import { Command } from "commander";
import { DefaultObject } from "./types.ts";

export const getAutoCompleteTree = (cli: Command) => {
  const traverseCommands = (
    command: Command,
    childTree: DefaultObject = {},
  ) => {
    const commandName = command.name();
    const isCommandRoot = commandName === "rrivctl";

    const allowedArgs = (command as any)._args
      .filter((a: any) => a.argChoices)
      .map((a: any) => a.argChoices);

    if (!isCommandRoot) {
      if (!command.commands.length) {
        if (allowedArgs.length) {
          childTree[commandName] = allowedArgs[0].reduce(
            (acc: DefaultObject, curr: string) => {
              acc[curr] = ["-h"];
              return acc;
            },
            {},
          );
        } else {
          childTree[commandName] = ["-h"];
        }
      } else {
        childTree[commandName] = {};
      }
    }

    for (const child of command.commands) {
      traverseCommands(
        child,
        !isCommandRoot ? childTree[commandName] : childTree,
      );
    }

    return childTree;
  };

  const tree = traverseCommands(cli, {});
  return tree;
};
