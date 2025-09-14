import { Command } from "commander";
import { testAction } from "./action.ts";

export const makeTestCommand = (cli: Command) => {
  cli.command("test").description("test command").action(testAction);
};
