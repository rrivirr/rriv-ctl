import { input, password } from "@inquirer/prompts";

export const passwordPrompt = async () => {
  const passwordValue = await password({
    message: "password",
    mask: true,
    validate: (v) => (v ? true : false),
  });

  return passwordValue;
};

export const authPrompt = async () => {
  const username = await input({
    message: "username",
    validate: (v) => (v ? true : false),
  });
  const passwordValue = await passwordPrompt();

  return { username, password: passwordValue };
};
