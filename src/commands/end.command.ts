import { Argument, Command } from "commander";
import { endContext } from "../modules/context/context.service.ts";
import { endDeviceContext } from "../modules/context/device-context.service.ts";

export const makeEndCommand = (cli: Command) => {
  cli
    .command("end")
    .addArgument(
      new Argument("<object>", "item").choices(["context", "device-context"])
    )
    .description("put a context to end or remove a device from a context")
    .action(async (object) => {
      if (object === "context") {
        await endContext();
        console.log("current context ended successfully");
      } else if (object === "device-context") {
        await endDeviceContext();
        console.log("device removed from current context successfully");
      }
    });
};
