import { Command } from "commander";
import { whoamiAction } from "./action.ts";

export const makeSignupCommand = (cli: Command) => {
  cli.command("whoami").description("get logged in user").action(whoamiAction);
};
