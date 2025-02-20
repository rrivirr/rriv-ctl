import { Argument, Command } from "commander";
import { sendCommandAndEchoResponse } from "../util/send-command-and-echo-response.ts";

export const makeCalibrateCommand = (cli: Command) => {
  cli
    .command("calibrate")
    .addArgument(new Argument("<object>").choices(["sensor"]))
    .argument("<id>", "The id of the sensor to calibrate.")
    .addArgument(
      new Argument("<subcommand>").choices(["point, list, fit, or clear"])
    )
    .argument(
      "[point]",
      "A reference reading for the point command, float type"
    )
    // .argument('[tag]')
    .description("calibration commands")
    .action((object, id, subcommand, point, tag) => {
      let payload = new Map();
      payload.set("object", object);
      payload.set("action", "calibrate");
      payload.set("id", id);
      payload.set("subcommand", subcommand);

      if (subcommand == "point") {
        if (point === null) {
          console.log("Point subcommand requires a point value");
          process.exit(1);
        } else {
          payload.set("point", parseFloat(point));
          payload.set("tag", tag);
        }
      }

      let payloadString = JSON.stringify(Object.fromEntries(payload)) + "\n";
      console.log(payloadString);

      sendCommandAndEchoResponse(payloadString);
    });
};
