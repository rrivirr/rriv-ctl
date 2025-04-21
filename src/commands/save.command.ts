import { Argument, Command } from "commander";
import { saveCurrentSnapshot } from "../modules/config/config-snapshot.service.ts";

export const makeSaveCommand = (cli: Command) => {
  cli
    .command("save")
    .addArgument(
      new Argument("<object>", "resource").choices(["config-snapshot"])
    )
    .requiredOption("-n, --name <name>")
    .action(async (object, options) => {
      if (object === "config-snapshot") {
        await saveCurrentSnapshot({ name: options.name });
      }
    });
};
