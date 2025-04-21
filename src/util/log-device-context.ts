import Table from "cli-table3";
import db from "../db/db.ts";

export const logDeviceContext = () => {
  const {
    device: { uniqueName },
    context: { name },
    deviceContext: { assignedDeviceName },
  } = db.data;

  const table = new Table({
    head: [
      "name of context",
      `device's unique name`,
      `device's assigned name in context`,
    ],
  });

  table.push([name, uniqueName, assignedDeviceName]);
  console.log(table.toString());
};
