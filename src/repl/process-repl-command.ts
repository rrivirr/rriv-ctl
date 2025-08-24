import { Command } from "commander";
import { REPLServer } from "repl";
import { extraSupportedCommands, getCommandNames, getPrompt } from "./utils.ts";
import { bold } from "yoctocolors";
import { errorHandler } from "../util/error-handler.ts";
import db from "../db/db.ts";
import { getConnectedDevice } from "../util/get-connected-device.ts";

export async function processReplCommand(
  replServer: REPLServer,
  args: string[],
  command: Command
) {
  const commandNames = getCommandNames(command);
  const commandName = args[0];
  if (commandName === "help") {
    console.log([...commandNames, ...extraSupportedCommands].join(" | "), "\n");
    console.log(`to view details of each command enter ${bold("command -h")}`);
  } else {
    const commandToExecute = command.commands.find(
      (c) => c.name() === commandName
    );
    if (!commandToExecute) {
      // should not happen
      console.log("Unexpected error occurred");
      process.exit(1);
    }

    // reset hack
    (commandToExecute.parent as any)._lifeCycleHooks = {};
    (commandToExecute as any)._optionValues = {};
    (commandToExecute as any)._hasHelpOption = true;

    if (
      !(
        (commandName === "use" && args[1] === "context") ||
        (commandName === "create" && args[1] === "context") ||
        (commandName === "list" && args[1] === "context") ||
        (commandName === "list" && args[1] === "device") ||
        (commandName === "end" && args[1] === "context") ||
        (commandName === "delete" && args[1] === "context") ||
        (commandName === "remove" && args[1] === "device") ||
        (commandName === "get" && args[1] === "data") ||
        (commandName === "auth" &&
          (args[1] === "logout" || args[1] === "whoami")) ||
        commandName === "sync"
      )
    ) {
      if (!(args.length === 2 && args[1] === "-h")) {
        const { context } = db.data;
        // check if context exists
        if (!context.id || !context.name) {
          console.log("no context found, context needed to proceed");
          return;
        }

        // check is device is connected and initialized
        if (
          !(
            commandName === "connect" ||
            (commandName === "list" && args[1] === "context-devices")
          )
        ) {
          const { device, deviceContext } = db.data;
          const connectedDevice = await getConnectedDevice(
            device.serialPortPath
          );

          if (
            !connectedDevice.serialNumber ||
            !connectedDevice.serialPortPath
          ) {
            console.log(`ensure your device is plugged in`);
            return;
          }

          if (
            !device.id ||
            !device.uniqueName ||
            !device.serialNumber ||
            device.serialNumber !== connectedDevice.serialNumber ||
            !deviceContext.deviceId ||
            !deviceContext.contextId ||
            !deviceContext.assignedDeviceName ||
            deviceContext.deviceId !== device.id ||
            deviceContext.contextId !== context.id
          ) {
            db.update((data) => {
              data.deviceContext = {
                contextId: "",
                deviceId: "",
                assignedDeviceName: "",
              };
              data.device = {
                id: "",
                serialNumber: "",
                uniqueName: "",
                serialPortPath: "",
              };
            });
            replServer.setPrompt(getPrompt());
            console.log(
              `device needs to be initialized; run 'connect' to initialize device`
            );
            return;
          }

          // incase the port path changed
          if (connectedDevice.serialPortPath !== device.serialPortPath) {
            db.update((data) => {
              data.device.serialPortPath = connectedDevice.serialPortPath;
            });
          }
        }
      }
    }

    replServer.setPrompt("");
    command
      .parseAsync(args, { from: "user" })
      .then(() => {
        if (commandName === "auth" && args[1] === "logout") {
          console.log(
            `closing session due to ${bold(`${args[1] === "logout" ? "logout" : `${commandName}`}`)} command`
          );
          replServer.close();
        } else {
          replServer.setPrompt(getPrompt());
          replServer.displayPrompt();
        }
      })
      .catch((error) => {
        errorHandler({ error, exit: false });
        replServer.setPrompt(getPrompt());
        replServer.displayPrompt();
      });
  }
}
