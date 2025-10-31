import Table from "cli-table3";
import { getFirmwareHistory } from "../../api/device.ts";
import { getActiveUser } from "../../util/get-logged-in-user.ts";

export const listFirmwareHistory = async (serialNumber?: string) => {
  const {
    accessToken,
    device: { id },
  } = getActiveUser();

  const firmwareHistory = await getFirmwareHistory({
    accessToken,
    ...(serialNumber ? { serialNumber } : { deviceId: id }),
  });

  if (firmwareHistory.length) {
    const tableHead = ["version", "installedAt", "createdAt"];
    if (serialNumber) {
      tableHead.push("context");
    }

    const table = new Table({
      head: tableHead,
      wordWrap: true,
      wrapOnWordBoundary: false,
    });
    for (const {
      version,
      installedAt,
      createdAt,
      contextName,
    } of firmwareHistory) {
      const row = [version, installedAt, createdAt];
      if (serialNumber) {
        row.push(contextName);
      }
      table.push(row);
    }
    console.log(table.toString());
  } else {
    console.log("no firmware history found");
  }
};
