import Table from "cli-table3";
import { ConfigLibrary } from "../api/types.ts";

export const logConfigLibrary = (configLibrary: ConfigLibrary[]) => {
  const table = new Table({
    head: ["name", "description", "created at", "creator"],
    wordWrap: true,
    wrapOnWordBoundary: false,
  });

  for (const {
    name,
    createdAt,
    description,
    Creator: { firstName, lastName },
  } of configLibrary) {
    table.push([name, description, createdAt, `${firstName} ${lastName}`]);
  }

  console.log("\n" + table.toString());
};
