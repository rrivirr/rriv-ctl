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
import { getActiveUser } from "../../util/get-logged-in-user.ts";

export const endContext = async () => {
  const {
    context: { id },
    email,
    env,
  } = getActiveUser();

  await updateContext({ id, end: true });
  db.update((data) => {
    data[email][env].context = { id: "", name: "" };
    data[email][env].deviceContext = {
      contextId: "",
      deviceId: "",
      assignedDeviceName: "",
    };
  });
};

export const listContexts = async (options: {
  name?: string;
  search?: string;
}) => {
  const { name, search } = options;
  const {
    context: { id: existingContextId },
  } = getActiveUser();

  const userContexts = await getContexts({ name, search });
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
};

export const useContext = async (name: string) => {
  const { email, env } = getActiveUser();

  const context = await getContextByName({
    contextName: name,
  });
  if (!context) {
    throw new Error("context specified does not exist");
  }
  if (context.endedAt) {
    throw new Error("context specified has already ended");
  }
  db.update((data) => {
    data[email][env].context = {
      id: context.id,
      name: context.name,
    };
    data[email][env].deviceContext = {
      contextId: "",
      deviceId: "",
      assignedDeviceName: "",
    };
  });
  console.log(`context successfully set to ${pronounce(context.name)}`);
};

export const deleteContext = async (name: string) => {
  const {
    context: { id: existingContextId },
    email,
    env,
  } = getActiveUser();

  const context = await getContextByName({
    contextName: name,
  });
  if (!context) {
    throw new Error("context specified does not exist");
  }
  await deleteContextApiCall({ id: context.id });
  console.log("context deleted successfully");
  if (existingContextId === context.id) {
    db.update((data) => {
      data[email][env].context = {
        id: "",
        name: "",
      };
      data[email][env].deviceContext = {
        contextId: "",
        deviceId: "",
        assignedDeviceName: "",
      };
    });
  }
};

export const createContext = async (options: { name: string }) => {
  const { name } = options;
  await createContextApiCall({ contextName: name });
  console.log("context created successfully");
};
