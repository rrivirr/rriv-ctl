import Table from "cli-table3";
import {
  getContextByName,
  getContexts,
  updateContext,
  deleteContext as deleteContextApiCall,
  createContext as createContextApiCall,
  shareContext as shareContextApiCall,
  getShareRecipients,
  getSharedContexts as getSharedContextsApiCall,
} from "../../api/context.ts";
import db from "../../db/db.ts";
import { pronounce } from "../../util/console-log.ts";
import { getActiveUser } from "../../util/get-logged-in-user.ts";

const getValidContextByName = async (name: string) => {
  const context = await getContextByName({
    contextName: name,
  });
  if (!context) {
    throw new Error("context specified does not exist");
  }
  if (context.endedAt) {
    throw new Error("context specified has already ended");
  }
  return context;
};

export const endContext = async (name?: string) => {
  const {
    context: { id },
    email,
    env,
  } = getActiveUser();

  let idToEnd;

  if (!name) {
    idToEnd = id;
    db.update((data) => {
      data[email][env].context = { id: "", name: "" };
      data[email][env].deviceContext = {
        contextId: "",
        deviceId: "",
        assignedDeviceName: "",
      };
    });
  } else {
    const context = await getContextByName({
      contextName: name,
    });
    if (!context) {
      throw new Error("context specified does not exist");
    }
    idToEnd = context.id;
  }

  if (!idToEnd) {
    throw new Error("no context found/specified to end");
  }

  await updateContext({ id: idToEnd, end: true });
  console.log("current context ended successfully");
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
    const table = new Table({
      head: ["id", "name", "startedAt", "endedAt", "owner"],
    });
    for (const { id, name, startedAt, endedAt, Account } of userContexts) {
      if (id === existingContextId) {
        table.push([
          pronounce(id),
          pronounce(name),
          pronounce(new Date(startedAt).toISOString()),
          pronounce(endedAt ? new Date(endedAt).toISOString() : ""),
          pronounce(Account?.email || ""),
        ]);
      } else {
        table.push([
          id,
          name,
          new Date(startedAt).toISOString(),
          endedAt ? new Date(endedAt).toISOString() : "",
          Account?.email,
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
  const context = await getValidContextByName(name);

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

export const createContext = async (name: string) => {
  await createContextApiCall({ contextName: name });
  console.log("context created successfully");
};

export const shareContext = async (body: {
  identifier: string;
  email: string;
}) => {
  const { identifier, email } = body;
  const context = await getValidContextByName(identifier);
  await shareContextApiCall({ email, id: context.id });
};

export const getContextShareRecipients = async (body: {
  identifier: string;
}) => {
  const { identifier } = body;
  const context = await getValidContextByName(identifier);
  const contexts = await getShareRecipients({ id: context.id });
  const table = new Table({ head: ["id", "name", "email"] });
  for (const { id, firstName, lastName, email } of contexts) {
    table.push([id, `${firstName} ${lastName}`, email]);
  }
  console.log(table.toString());
};

export const getSharedContexts = async () => {
  const contexts = await getSharedContextsApiCall();

  const table = new Table({ head: ["id", "name", "startedAt", "endedAt"] });
  for (const { id, name, startedAt, endedAt } of contexts) {
    table.push([id, name, startedAt, endedAt]);
  }
  console.log(table.toString());
};
