import { Command } from "commander";
import { REPLServer } from "repl";
import { getPrompt } from "./utils.ts";
import { errorHandler } from "../util/error-handler.ts";
import db from "../db/db.ts";
import { getConnectedDevice } from "../util/get-connected-device.ts";

export async function processReplCommand(
  replServer: REPLServer,
  args: string[],
  command: Command
) {
  const commandName = args[0];
  if (commandName === "help") {
    command
      .parseAsync(["rrivctl", "-h"], {
        from: "user",
      })
      .then(() => {
        replServer.setPrompt(getPrompt());
        replServer.displayPrompt();
      })
      .catch((error) => {
        errorHandler({ error, exit: false });
        replServer.setPrompt(getPrompt());
        replServer.displayPrompt();
      });
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
            (commandName === "list" && args[1] === "device")
          )
        ) {
          const { device, deviceContext } = db.data;
          const connectedDevice = await getConnectedDevice(
            device.serialPortPath
          );

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
        replServer.setPrompt(getPrompt());
        replServer.displayPrompt();
      })
      .catch((error) => {
        errorHandler({ error, exit: false });
        replServer.setPrompt(getPrompt());
        replServer.displayPrompt();
      });
  }
}
