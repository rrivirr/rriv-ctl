import { Argument, Command } from "commander";
import { removeAction } from "./action.ts";

export const makeRemoveCommand = (cli: Command) => {
  cli
    .command("remove")
    .addArgument(
      new Argument("<object>").choices([
        "sensor",
        "actuator",
        "telemeter",
        "device",
      ]),
    )
    .option("-a, --all", "remove all sensors")
    .argument("[id]", "or serial number in the case of device")
    .description("remove an object")
    .action(removeAction);
};
