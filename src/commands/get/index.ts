import { Argument, Command, Option } from "commander";
import { getAction } from "./action.ts";
import { CONFIGS } from "../../constants.ts";

export const makeGetCommand = (cli: Command) => {
  const helpOption = new Option("-h, --help", "display help for command");
  const getCommand: Record<
    string,
    { description: string; usage: string; options: Option[] }
  > = {
    data: {
      description: "Get data for a device",
      usage: "rrivctl get [options] data <identifier> [startDate] [endDate]",
      options: [
        new Option("-f, --fileName [fileName]"),
        new Option("-l, --limit [limit]"),
      ],
    },
    sensor: {
      description: "Get config values for a sensor",
      usage: "rrivctl get sensor <id>",
      options: [helpOption],
    },
    datalogger: {
      description: "Get config values for the datalogger",
      usage: "rrivctl get datalogger",
      options: [helpOption],
    },
    board: {
      description: "Get config values on the board",
      usage: "rrivctl get board <parameter>",
      options: [helpOption],
    },
  };

  cli
    .command("get")
    .addArgument(
      new Argument("<object>").choices([...CONFIGS, "data", "config-snapshot"]),
    )
    .argument("[id]")
    .argument("[parameterOrstartDate]")
    .argument("[endDate]")
    .addOption(getCommand.data.options[0])
    .addOption(getCommand.data.options[1])
    .configureHelp({
      commandUsage: (cmd: Command) => {
        const arg = cmd.args[0];
        if (arg in getCommand) {
          return getCommand[arg].usage;
        }
        return `rrivctl get [options] <object> [id] `;
      },
      commandDescription: (cmd: Command) => {
        const arg = cmd.args[0];
        if (arg in getCommand) {
          return getCommand[arg].description;
        }
        return `Get values for an object.\nSupported objects are ${[...CONFIGS, "data", "config-snapshot"].join(", ")}`;
      },
      visibleOptions(cmd: Command) {
        const arg = cmd.args[0];
        if (arg in getCommand) {
          return getCommand[arg].options;
        }
        return [helpOption];
      },
    })
    .action(getAction);
};
