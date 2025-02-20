import { input, rawlist, confirm } from "@inquirer/prompts";

export const contextPrompt = async () => {
  console.log("create new context...\n");

  const contextName = await input({
    message: "name of context",
    validate: (v) =>
      v.trim().length >= 3 ? true : "value must have at least 3 letters",
  });

  return { contextName };
};

export const selectContextPrompt = async (contexts: string[]) => {
  const contextName = await rawlist({
    message: "Select a context to work in",
    choices: contexts.map((c) => ({ name: c, value: c })),
  });

  return { contextName };
};

export const confirmContextPrompt = async (contextName: string) => {
  console.log(`Existing context found...`);
  const answer = await confirm({ message: `Continue with ${contextName}?` });
  return answer;
};
