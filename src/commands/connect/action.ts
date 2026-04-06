import { getConnectedDevice } from "../../util/get-connected-device.ts";
import db from "../../db/db.ts";
import { getDevices } from "../../api/device.ts";
import { bindDevice } from "../../util/bind-device.ts";
import { Device } from "../../api/types.ts";
import { createDeviceContext } from "../../modules/context/device-context.service.ts";
import { uploadDataloggerConfig } from "../../modules/config/datalogger-config.service.ts";
import { bold, italic } from "yoctocolors";
import { getActiveUser } from "../../util/get-logged-in-user.ts";
import { sendCommands } from "../../infra/send-commands.ts";
import { applyInitSettings } from "./helper.ts";

export const connectAction = async (options: any) => {
  const {
    assignedDeviceName,
    path,
    fromRunCheck,
    connectedDeviceInfo,
    interactiveMode,
  } = options;

  let connectedDevice: Awaited<ReturnType<typeof getConnectedDevice>> =
    connectedDeviceInfo;

  if (!connectedDevice) {
    connectedDevice = await getConnectedDevice({
      specifiedSerialPortPath: path,
      fromRunCheck,
    });
  }

  const serialNumber = connectedDevice!.serialNumber;
  const serialPortPath = connectedDevice!.serialPortPath;

  const user = getActiveUser();
  const {
    device: {
      id,
      uniqueName: existingUniqueName,
      serialNumber: existingSerialNumber,
    },
    context,
  } = user;

  let toBindDevice = false;
  let pullConfig = false;
  let device: Device | undefined;
  if (!id || !existingUniqueName || !existingSerialNumber || id === "guest") {
    toBindDevice = true;
  }

  if (!toBindDevice) {
    const devices = await getDevices({ id });
    const existingDevice = devices[0];

    if (
      !existingDevice ||
      existingDevice.uniqueName !== existingUniqueName ||
      existingDevice.serialNumber !== existingSerialNumber ||
      serialNumber !== existingDevice.serialNumber
    ) {
      toBindDevice = true;
    } else {
      device = existingDevice;
    }
  }

  if (toBindDevice) {
    const devices = await getDevices({ serialNumber });
    device = devices[0];
    if (!device) {
      try {
        device = await bindDevice({
          serialNumber,
        });
        pullConfig = true;
      } catch (e: any) {
        console.log("accessing device as guest...\n");
        if (e?.response?.data?.message === "device bound to another user") {
          db.update((data) => {
            data[user.email][user.env].device = {
              id: "guest",
              uniqueName: "guest",
              serialNumber: serialNumber,
              serialPortPath,
            };
          });
          await applyInitSettings(interactiveMode);
          return;
        }
        throw e;
      }
    }
  }

  if (!device) {
    // should not happen
    throw new Error("Internal server error; no device");
  }

  db.update((data) => {
    data[user.email][user.env].device = {
      id: device.id,
      uniqueName: device.uniqueName,
      serialNumber: device.serialNumber,
      serialPortPath,
    };
  });

  const { id: currentContextId } = context;
  let deviceNameToAssign = assignedDeviceName;

  if (device.DeviceContext?.length) {
    const deviceContext = device.DeviceContext[0];
    if (deviceContext.Context.id === currentContextId) {
      deviceNameToAssign = deviceContext.assignedDeviceName;
    } else {
      throw new Error(
        `device already in another context: ${bold(deviceContext.Context.name)}`,
      );
    }
  } else if (!assignedDeviceName) {
    throw new Error(
      `device yet to be added to current context\nrun ${italic("rrivctlv2 connect --assigned-device-name <name to assign device in current context>")}`,
    );
  } else {
    await createDeviceContext({
      contextId: currentContextId,
      deviceId: device.id,
      assignedDeviceName,
    });
  }

  db.update((data) => {
    data[user.email][user.env].deviceContext = {
      contextId: currentContextId,
      deviceId: device.id,
      assignedDeviceName: deviceNameToAssign,
    };
  });

  // set epoch
  await applyInitSettings(interactiveMode);
  if (pullConfig) {
    const result = await sendCommands(
      [JSON.stringify({ object: "datalogger", action: "get" })],
      false,
    );
    await uploadDataloggerConfig({ ...result[0], object: "datalogger" });
  }
};
