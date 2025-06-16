import { Argument, Command } from "commander";
import { endAction } from "./action.ts";

export const makeEndCommand = (cli: Command) => {
  cli
    .command("end")
    .addArgument(
      new Argument("<object>", "item").choices(["context", "device-context"])
    )
    .description("put a context to end or remove a device from a context")
    .action(endAction);
};
