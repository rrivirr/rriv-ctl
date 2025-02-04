import { Argument, Command } from "commander";
import { sendCommandAndEchoResponse } from "../util/send-command-and-echo-response";

export const makeRemoveCommand = (cli: Command) => {
  cli
    .command("remove")
    .addArgument(
      new Argument("<object>").choices(["sensor", "actuator", "telemeter"])
    )
    .argument("<id>")
    .description("remove an object")
    .action((object, id) => {
      let payload = new Map();
      payload.set("object", object);
      payload.set("action", "remove");
      payload.set("id", id);
      let payloadString = JSON.stringify(Object.fromEntries(payload)) + "\n";
      console.log(payloadString);

      sendCommandAndEchoResponse(payloadString);
    });
};
