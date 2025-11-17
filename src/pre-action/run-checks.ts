import { getContexts, createContext } from "../api/context.ts";
import db from "../db/db.ts";
import { getConnectedDevice } from "../util/get-connected-device.ts";
import { getPrompt } from "../repl/utils.ts";
import { REPLServer } from "repl";
import { connectAction } from "../commands/connect/action.ts";
import { getActiveUser } from "../util/get-logged-in-user.ts";

export const runChecks = async (body: {
  commandName: string;
  commandArgument: string;
  replServer?: REPLServer;
}) => {
  const { email, accessToken, context, device, deviceContext } =
    getActiveUser();

  const { commandName, commandArgument, replServer } = body;
  if (
    !(
      (commandName === "use" && commandArgument === "context") ||
      (commandName === "create" && commandArgument === "context") ||
      (commandName === "list" && commandArgument === "context") ||
      (commandName === "end" && commandArgument === "context") ||
      (commandName === "delete" && commandArgument === "context") ||
      (commandName === "remove" && commandArgument === "device") ||
      (commandName === "get" && commandArgument === "data") ||
      commandName === "sync"
    )
  ) {
    if (commandArgument !== "-h") {
      // check if context exists
      if (!context.id || !context.name) {
        const contexts = await getContexts({ accessToken });
        if (!contexts.length) {
          const context = await createContext({
            contextName: "rrivctl",
            accessToken,
          });
          db.update((data) => {
            data[email].context = {
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
              data[email].context = {
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
          (commandName === "list" && commandArgument === "device")
        )
      ) {
        const connectedDevice = await getConnectedDevice({
          fromRunCheck: true,
        });

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
            data[email].deviceContext = {
              contextId: "",
              deviceId: "",
              assignedDeviceName: "",
            };
            data[email].device = {
              id: "",
              serialNumber: "",
              uniqueName: "",
              serialPortPath: "",
            };
          });
          await connectAction({ fromRunCheck: true });
          if (replServer) {
            replServer.setPrompt(getPrompt());
          }
        }

        // incase the port path changed
        if (connectedDevice.serialPortPath !== device.serialPortPath) {
          db.update((data) => {
            data[email].device.serialPortPath = connectedDevice.serialPortPath;
          });
        }
      }
    }
  }
};
