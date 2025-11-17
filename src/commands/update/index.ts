import { Command, Option } from "commander";
import { updateAction } from "./action.ts";
import { UPDATE_CHANNEL } from "../../constants.ts";

export const makeUpdateCommand = (cli: Command) => {
  cli
    .command("update")
    .description("update rrivctl, unsupported in the interactive shell")
    .argument("[tag]", "update to tagged release")
    .addOption(new Option("-c ,--channel [channel]").choices(UPDATE_CHANNEL))
    .action(updateAction);
};
