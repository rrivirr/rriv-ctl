import { Argument, Command } from "commander";
import { registerEuiAction } from "../provision/action.ts";
import { listApplications } from "./action.ts";

export const makeTelemetryCommand = (cli: Command) => {
  const telemetryCommand = cli.command("telemetry");
  const lorawanCommand = telemetryCommand.command("lorawan");

  lorawanCommand
    .command("provision")
    .argument("[application]")
    .action(registerEuiAction);

  lorawanCommand
    .command("list")
    .addArgument(new Argument("<object>", "resource").choices(["application"]))
    .action(listApplications);
};
