import Table from "cli-table3";
import { getApplications } from "../../api/device.ts";
import { oraPromise } from "../../util/ora-promise.ts";

export const listApplications = async () => {
  const applications = await oraPromise(getApplications);
  const table = new Table({
    head: ["name"],
  });
  for (const { name } of applications) {
    table.push([name]);
  }
  console.log(table.toString());
};
