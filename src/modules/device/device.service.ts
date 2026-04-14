import Table from "cli-table3";
import {
  unbindDevice as unbindDeviceApiCall,
  getDevices as getDevicesApiCall,
  getLogs,
  createLog,
} from "../../api/device.ts";
import db from "../../db/db.ts";
import { pronounce } from "../../util/console-log.ts";
import { getActiveUser } from "../../util/get-logged-in-user.ts";

export const unbindDevice = async (serialNumber: string) => {
  const { email, env } = getActiveUser();

  await unbindDeviceApiCall({ serialNumber });

  db.update((data) => {
    data[email][env].deviceContext = {
      contextId: "",
      deviceId: "",
      assignedDeviceName: "",
    };
    data[email][env].device = {
      id: "",
      serialNumber: "",
      uniqueName: "",
      serialPortPath: "",
    };
  });
  console.log("device removed from your account successfully");
};

export const listDevices = async () => {
  const {
    device: { id: deviceId },
  } = getActiveUser();

  const devices = await getDevicesApiCall({});
  if (devices.length) {
    const table = new Table({
      head: [
        "id",
        "uniqueName",
        "serialNumber",
        "context",
        "assignedDeviceName",
      ],
    });
    for (const { id, uniqueName, serialNumber, DeviceContext } of devices) {
      const assignedDeviceName = DeviceContext[0]?.assignedDeviceName;
      const name = DeviceContext[0]?.Context?.name;

      if (id === deviceId) {
        table.push([
          pronounce(id),
          pronounce(uniqueName),
          pronounce(serialNumber),
          pronounce(name),
          pronounce(assignedDeviceName),
        ]);
      } else {
        table.push([id, uniqueName, serialNumber, name, assignedDeviceName]);
      }
    }
    console.log("\n" + table.toString());
  } else {
    console.log("no devices found bound to you");
  }
};

export const listLogs = async (identifier?: string) => {
  const {
    device: { serialNumber: connectedSerialNumber },
  } = getActiveUser();
  if (!connectedSerialNumber && !identifier) {
    throw new Error("serial number is required");
  }

  const logs = await getLogs({
    identifier: identifier || connectedSerialNumber,
  });

  if (logs.length) {
    const table = new Table({
      head: ["log", "createdAt", "createdBy"],
      wordWrap: true,
      wrapOnWordBoundary: false,
    });
    for (const {
      log,
      createdAt,
      Creator: { firstName, lastName },
    } of logs) {
      table.push([log, createdAt, `${firstName} ${lastName}`]);
    }
    console.log(table.toString());
  } else {
    console.log("no logs found");
  }
};

export const addLog = async (log: string, identifier?: string) => {
  const {
    device: { serialNumber: connectedSerialNumber },
  } = getActiveUser();

  if (!connectedSerialNumber && !identifier) {
    throw new Error("serial number is required");
  }

  await createLog({ log, identifier: identifier || connectedSerialNumber });
  console.log("successful");
};
