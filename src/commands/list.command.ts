import { Argument, Command } from "commander";
import { sendCommandAndEchoResponse } from "../util/send-command-and-echo-response";

export const makeListCommand = (cli: Command) => {
  cli
    .command("list")
    .addArgument(
      new Argument("<object>").choices(["sensor", "actuator", "telemeter"])
    )
    .description("get values on an object or create an object")
    .action((object) => {
      let payload = new Map();
      payload.set("object", object);
      payload.set("action", "list");
      let payloadString = JSON.stringify(Object.fromEntries(payload)) + "\n";

      sendCommandAndEchoResponse(payloadString);
    });
};
