import Table from "cli-table3";
import * as DeviceContextApiCalls from "../../api/device-context.ts";
import { getDevices } from "../../api/device.ts";
import db from "../../db/db.ts";
import { pronounce } from "../../util/console-log.ts";
import { getActiveUser } from "../../util/get-logged-in-user.ts";

export const endDeviceContext = async () => {
  const {
    deviceContext: { deviceId, contextId },
    email,
    env,
  } = getActiveUser();

  await DeviceContextApiCalls.updateDeviceContext({
    deviceId,
    contextId,
    end: true,
  });
  db.update((data) => {
    data[email][env].deviceContext = {
      contextId: "",
      deviceId: "",
      assignedDeviceName: "",
    };
  });
};

export const createDeviceContext = async (body: {
  contextId: string;
  deviceId: string;
  assignedDeviceName: string;
}) => {
  await DeviceContextApiCalls.createDeviceContext({
    ...body,
  });
};

export const listContextDevices = async () => {
  const {
    context: { id },
    deviceContext: { deviceId },
  } = getActiveUser();

  const contextDevices = await getDevices({ contextId: id });
  if (contextDevices.length) {
    const table = new Table({
      head: ["id", "uniqueName", "serialNumber", "assignedDeviceName"],
    });
    for (const {
      id,
      uniqueName,
      serialNumber,
      DeviceContext,
    } of contextDevices) {
      const assignedDeviceName = DeviceContext[0]?.assignedDeviceName;
      if (id === deviceId) {
        table.push([
          pronounce(id),
          pronounce(uniqueName),
          pronounce(serialNumber),
          pronounce(assignedDeviceName),
        ]);
      } else {
        table.push([id, uniqueName, serialNumber, assignedDeviceName]);
      }
    }
    console.log("\n" + table.toString());
  } else {
    console.log("no devices found in current context");
  }
};
