import { Argument, Command, Option } from "commander";
import { getAction } from "./action.ts";
import { CONFIGS } from "../../constants.ts";

export const makeGetCommand = (cli: Command) => {
  const helpOption = new Option("-h, --help", "display help for command");
  const getCommand: Record<
    string,
    { description: string; usage: string; options: Option[] }
  > = {
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
    .addArgument(new Argument("<object>").choices([...CONFIGS]))
    .argument("[id]")
    .argument("[parameter]")
    .configureHelp({
      commandUsage: (cmd: Command) => {
        const arg = cmd.args[0];
        if (arg in getCommand) {
          return getCommand[arg].usage;
        }
        return `rrivctl get <object> [id] [parameter]`;
      },
      commandDescription: (cmd: Command) => {
        const arg = cmd.args[0];
        if (arg in getCommand) {
          return getCommand[arg].description;
        }
        return `Get values from the device.\nSupported objects are ${
          [...CONFIGS].join(", ")
        }`;
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
