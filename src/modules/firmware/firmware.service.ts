import Table from "cli-table3";
import { getFirmwareHistory } from "../../api/device.ts";
import db from "../../db/db.ts";

export const listFirmwareHistory = async (serialNumber?: string) => {
  const {
    accessToken,
    device: { id },
  } = db.data;

  const firmwareHistory = await getFirmwareHistory({
    accessToken,
    ...(serialNumber ? { serialNumber } : { deviceId: id }),
  });
  if (firmwareHistory.length) {
    const table = new Table({
      head: ["version", "installedAt", "createdAt"],
      wordWrap: true,
      wrapOnWordBoundary: false,
    });
    for (const { version, installedAt, createdAt } of firmwareHistory) {
      table.push([version, installedAt, createdAt]);
    }
    console.log(table.toString());
  } else {
    console.log("no firmware history found");
  }
};
