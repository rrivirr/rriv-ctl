import Table from "cli-table3";
import { getContextByName, getContexts } from "../../api/context.ts";
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
      head: ["name", "startedAt", "endedAt", "owner"],
    });
    for (const { id, name, startedAt, endedAt, Account } of userContexts) {
      if (id === existingContextId) {
        table.push([
          pronounce(name),
          pronounce(new Date(startedAt).toISOString()),
          pronounce(endedAt ? new Date(endedAt).toISOString() : ""),
          pronounce(Account?.email || ""),
        ]);
      } else {
        table.push([
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
