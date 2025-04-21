import Table from "cli-table3";
import { getContexts, updateContext } from "../../api/context.ts";
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
}) => {
  const { current, name } = options;
  const {
    context: { name: existingContextName, id: existingContextId },
    accessToken,
  } = db.data;
  if (current) {
    console.log(`context currently set to ${pronounce(existingContextName)}`);
  } else {
    const userContexts = await getContexts({ accessToken, name });
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
      console.log(table.toString());
    } else {
      console.log("no contexts found with given parameters");
    }
  }
};
