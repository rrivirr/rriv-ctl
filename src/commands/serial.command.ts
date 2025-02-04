import { Argument, Command } from "commander";
import { sendCommandAndEchoResponse } from "../util/send-command-and-echo-response";

export const makeSerialCommand = (cli: Command) => {
  cli
    .command("serial")
    .addArgument(new Argument("action").choices(["send"]))
    .argument("<message>")
    .description("board command: send payload to usart output")
    .action((action, message) => {
      let message_to_send = message;
      if (message_to_send.startsWith("0x")) {
        console.log("Sending hex");
        const number = Number(message_to_send);
        message_to_send = message.substring(2);
        console.log(message_to_send);
      }

      let payload = new Map();
      payload.set("object", "serial");
      payload.set("action", action);
      payload.set("message", message_to_send);

      let payloadString = JSON.stringify(Object.fromEntries(payload)) + "\n";
      console.log(payloadString);

      sendCommandAndEchoResponse(payloadString);
    });
};
