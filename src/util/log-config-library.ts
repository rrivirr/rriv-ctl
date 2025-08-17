import Table from "cli-table3";
import { ConfigLibrary } from "../api/types.ts";

export const logConfigLibrary = (configLibrary: ConfigLibrary[]) => {
  const table = new Table({
    head: ["id", "name", "description", "created at", "creator"],
    wordWrap: true,
    wrapOnWordBoundary: false,
  });

  for (const {
    id,
    name,
    createdAt,
    description,
    Creator: { firstName, lastName },
  } of configLibrary) {
    table.push([id, name, description, createdAt, `${firstName} ${lastName}`]);
  }

  console.log("\n" + table.toString());
};
