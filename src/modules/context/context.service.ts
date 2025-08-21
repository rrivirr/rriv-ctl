import Table from "cli-table3";
import {
  getContextByName,
  getContexts,
  updateContext,
  deleteContext as deleteContextApiCall,
  createContext as createContextApiCall,
} from "../../api/context.ts";
import db from "../../db/db.ts";
import { pronounce } from "../../util/console-log.ts";

export const endContext = async () => {
  const {
    context: { id },
    accessToken,
  } = db.data;

  await updateContext({ id, accessToken, end: true });
  db.update((data) => {
    data.context = { id: "", name: "" };
    data.deviceContext = {
      contextId: "",
      deviceId: "",
      assignedDeviceName: "",
    };
  });
};

export const listContexts = async (options: {
  current?: boolean;
  name?: string;
  search?: string;
}) => {
  const { current, name, search } = options;
  const {
    context: { name: existingContextName, id: existingContextId },
    accessToken,
  } = db.data;
  if (current) {
    console.log(`context currently set to ${pronounce(existingContextName)}`);
  } else {
    const userContexts = await getContexts({ accessToken, name, search });
    if (userContexts.length) {
      const table = new Table({ head: ["id", "name", "startedAt", "endedAt"] });
      for (const { id, name, startedAt, endedAt } of userContexts) {
        if (id === existingContextId) {
          table.push([
            pronounce(id),
            pronounce(name),
            pronounce(new Date(startedAt).toISOString()),
            pronounce(endedAt ? new Date(endedAt).toISOString() : ""),
          ]);
        } else {
          table.push([
            id,
            name,
            new Date(startedAt).toISOString(),
            endedAt ? new Date(endedAt).toISOString() : "",
          ]);
        }
      }
      console.log("\n" + table.toString());
    } else {
      console.log("no contexts found with given parameters");
    }
  }
};

export const useContext = async (name: string) => {
  const { accessToken } = db.data;

  const context = await getContextByName({
    contextName: name,
    accessToken,
  });
  if (!context) {
    throw new Error("context specified does not exist");
  }
  if (context.endedAt) {
    throw new Error("context specified has already ended");
  }
  db.update((data) => {
    data.context = {
      id: context.id,
      name: context.name,
    };
    data.deviceContext = {
      contextId: "",
      deviceId: "",
      assignedDeviceName: "",
    };
  });
  console.log(`context successfully set to ${pronounce(context.name)}`);
};

export const deleteContext = async (name: string) => {
  const {
    accessToken,
    context: { id: existingContextId },
  } = db.data;

  const context = await getContextByName({
    contextName: name,
    accessToken,
  });
  if (!context) {
    throw new Error("context specified does not exist");
  }
  await deleteContextApiCall({ id: context.id, accessToken });
  console.log("context deleted successfully");
  if (existingContextId === context.id) {
    db.update((data) => {
      data.context = {
        id: "",
        name: "",
      };
      data.deviceContext = {
        contextId: "",
        deviceId: "",
        assignedDeviceName: "",
      };
    });
  }
};

export const createContext = async (options: { name: string }) => {
  const { name } = options;
  const { accessToken } = db.data;
  await createContextApiCall({ accessToken, contextName: name });
  console.log("context created successfully");
};
