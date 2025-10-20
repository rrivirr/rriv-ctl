import { getContexts, createContext } from "../api/context.ts";
import db from "../db/db.ts";
import { getConnectedDevice } from "../util/get-connected-device.ts";
import { getPrompt } from "../repl/utils.ts";
import { REPLServer } from "repl";

export const runChecks = async (body: {
  commandName: string;
  commandArgument: string;
  replServer?: REPLServer;
}) => {
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
      const { context, accessToken } = db.data;
      // check if context exists
      if (!context.id || !context.name) {
        const contexts = await getContexts({ accessToken });
        if (!contexts.length) {
          const context = await createContext({
            contextName: "rrivctl",
            accessToken,
          });
          db.update((data) => {
            data.context = {
              id: context.id,
              name: context.name,
            };
          });
        } else {
          const defaultContext = contexts.find((c) => c.name === "rrivctl");
          if (!defaultContext) {
            console.log("no context found, select context to proceed");
            return false;
          } else {
            db.update((data) => {
              data.context = {
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
        const { device, deviceContext } = db.data;
        const connectedDevice = await getConnectedDevice();

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
          if (replServer) {
            replServer.setPrompt(getPrompt());
          }
          console.log(
            `device needs to be initialized; run 'connect' to initialize device`
          );
          return false;
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
  return true;
};
