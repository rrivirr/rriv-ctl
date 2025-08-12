import { Command } from "commander";
import { updateAction } from "./action.ts";

export const makeUpdateCommand = (cli: Command) => {
  cli.command("update").description("update rrivctl").action(updateAction);
};
