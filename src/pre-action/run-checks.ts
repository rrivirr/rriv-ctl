import { getContexts, createContext } from "../api/context.ts";
import db from "../db/db.ts";
import { getConnectedDevice } from "../util/get-connected-device.ts";
import { getPrompt } from "../repl/utils.ts";
import { REPLServer } from "repl";
import { connectAction } from "../commands/connect/action.ts";
import { getActiveUser } from "../util/get-logged-in-user.ts";
import { Context } from "../api/types.ts";
import { errorHandler } from "../util/error-handler.ts";

export const runChecks = async (body: {
  commandName: string;
  commandArgument: string;
  commandSecondArgument?: string; // repl
  commandParentName?: string; // cli
  replServer?: REPLServer;
}) => {
  const { email, context, device, deviceContext, env } = getActiveUser();

  // bypass everything
  let contexts: Context[];

  try {
    contexts = await getContexts({});
  } catch (error) {
    await errorHandler({ error, doNothing: true });
    return;
  }

  const {
    commandName,
    commandArgument,
    commandSecondArgument,
    replServer,
    commandParentName,
  } = body;
  if (
    !(
      (commandName === "context" && commandArgument !== "device") || // from repl
      commandParentName === "context" ||
      (commandName === "remove" && commandArgument === "device") ||
      (commandName === "get" && commandArgument === "data") ||
      commandName === "sync"
    )
  ) {
    if (commandArgument !== "-h") {
      // check if context exists
      if (!context.id || !context.name) {
        if (!contexts.length) {
          const context = await createContext({
            contextName: "rrivctl",
          });
          db.update((data) => {
            data[email][env].context = {
              id: context.id,
              name: context.name,
            };
          });
        } else {
          const defaultContext = contexts.find((c) => c.name === "rrivctl");
          if (!defaultContext) {
            throw new Error("no context found, select context to proceed");
          } else {
            db.update((data) => {
              data[email][env].context = {
                id: defaultContext.id,
                name: defaultContext.name,
              };
            });
          }
        }
      }

      // check is device is connected and initialized
      if (
        !(
          commandName === "connect" ||
          commandName === "flash" ||
          (commandName === "list" && commandParentName === "device") || // cli
          (commandName === "context" && // repl
            commandArgument === "device" &&
            commandSecondArgument === "list")
        )
      ) {
        const connectedDevice = await getConnectedDevice({
          fromRunCheck: true,
        });

        if (
          !device.id ||
          !device.uniqueName ||
          !device.serialNumber ||
          device.serialNumber !== connectedDevice?.serialNumber ||
          !deviceContext.deviceId ||
          !deviceContext.contextId ||
          !deviceContext.assignedDeviceName ||
          deviceContext.deviceId !== device.id ||
          deviceContext.contextId !== context.id
        ) {
          db.update((data) => {
            data[email][env].deviceContext = {
              contextId: "",
              deviceId: "",
              assignedDeviceName: "",
            };
            data[email][env].device = {
              id: "",
              serialNumber: "",
              uniqueName: "",
              serialPortPath: "",
            };
          });
          await connectAction({
            fromRunCheck: true,
            connectedDeviceInfo: connectedDevice,
          });
          if (replServer) {
            replServer.setPrompt(getPrompt());
          }
        }

        // incase the port path changed
        if (connectedDevice?.serialPortPath !== device.serialPortPath) {
          db.update((data) => {
            data[email][env].device.serialPortPath =
              connectedDevice!.serialPortPath;
          });
        }
      }
    }
  }
};
