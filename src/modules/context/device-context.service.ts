import Table from "cli-table3";
import * as DeviceContextApiCalls from "../../api/device-context.ts";
import { getDevices } from "../../api/device.ts";
import db from "../../db/db.ts";
import { pronounce } from "../../util/console-log.ts";
import { getActiveUser } from "../../util/get-logged-in-user.ts";

export const renameDeviceInContext = async (
  name: string,
  deviceIdentifier?: string,
) => {
  let deviceId;
  let contextId;
  const {
    deviceContext: {
      deviceId: connectedDeviceId,
      contextId: connectedContextId,
    },
    email,
    env,
  } = getActiveUser();

  if (deviceIdentifier) {
    const devices = await getDevices({ identifier: deviceIdentifier });
    if (!devices.length) {
      throw new Error("invalid identifier received");
    }
    deviceId = devices[0].id;
    contextId = devices[0].DeviceContext[0].Context.id;

    if (!contextId) {
      throw new Error("device specified not in a context");
    }
  } else {
    if (!connectedDeviceId || !connectedContextId) {
      throw new Error("connect your device or specify a device to rename");
    }
    deviceId = connectedDeviceId;
    contextId = connectedContextId;
  }

  await DeviceContextApiCalls.updateDeviceContext({
    deviceId,
    contextId,
    assignedDeviceName: name,
  });

  if (!deviceIdentifier) {
    db.update((data) => {
      data[email][env].deviceContext = {
        contextId,
        deviceId,
        assignedDeviceName: name,
      };
    });
  }
};

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
  console.log("device removed from current context successfully");
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
      head: ["uniqueName", "serialNumber", "assignedDeviceName"],
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
          pronounce(uniqueName),
          pronounce(serialNumber),
          pronounce(assignedDeviceName),
        ]);
      } else {
        table.push([uniqueName, serialNumber, assignedDeviceName]);
      }
    }
    console.log("\n" + table.toString());
  } else {
    console.log("no devices found in current context");
  }
};
