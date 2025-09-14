import { Argument, Command } from "commander";
import { calibrateAction } from "./action.ts";

export const makeCalibrateCommand = (cli: Command) => {
  cli
    .command("calibrate")
    .addArgument(new Argument("<object>").choices(["sensor"]))
    .argument("<id>", "The id of the sensor to calibrate.")
    .addArgument(
      new Argument("<subcommand>").choices(["point", "list", "fit", "clear"])
    )
    .argument(
      "[point]",
      "A reference reading for the point command, float type"
    )
    // .argument('[tag]')
    .description("calibration commands")
    .action(calibrateAction);
};
