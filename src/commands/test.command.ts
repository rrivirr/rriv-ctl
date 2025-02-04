import { Command } from "commander";

export const makeTestCommand = (cli: Command) => {
  cli
    .command("test")
    .description("test command")
    .action(() => {
      console.log("test command called");
    });
};
