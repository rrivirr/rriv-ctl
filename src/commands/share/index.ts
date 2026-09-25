import { Argument, Command } from "commander";
import { listShareRecipientsAction, shareAction } from "./action.ts";

export const makeShareCommand = (cli: Command) => {
  const shareCommand = cli.command("share");

  shareCommand
    .addArgument(new Argument("object", "resource").choices(["context"]))
    .argument("identifier")
    .argument("email")
    .description("share access to resource")
    .action(shareAction);

  shareCommand
    .command("list")
    .addArgument(new Argument("object", "resource").choices(["context"]))
    .argument("[identifier]")
    .action(listShareRecipientsAction);
};
