import { getConnectedDevice } from "../../util/get-connected-device.ts";
import db from "../../db/db.ts";
import { getDevices } from "../../api/device.ts";
import { bindDevice } from "../../util/bind-device.ts";
import { Device } from "../../api/types.ts";
import { createDeviceContext } from "../../modules/context/device-context.service.ts";
import { uploadDataloggerConfig } from "../../modules/config/datalogger-config.service.ts";
import { bold } from "yoctocolors";
import { getActiveUser } from "../../util/get-logged-in-user.ts";
import { sendCommands } from "../../infra/send-commands.ts";
import { applyInitSettings } from "./helper.ts";
import { errorHandler } from "../../util/error-handler.ts";
import { oraPromise } from "../../util/ora-promise.ts";

export const connectAction = async (options: any) => {
  const { path, fromRunCheck, connectedDeviceInfo, interactiveMode } = options;

  let connectedDevice: Awaited<ReturnType<typeof getConnectedDevice>> =
    connectedDeviceInfo;

  if (!connectedDevice) {
    connectedDevice = await oraPromise(() =>
      getConnectedDevice({
        specifiedSerialPortPath: path,
        fromRunCheck,
      }),
    );
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
    let devices;
    try {
      devices = await oraPromise(() => getDevices({ id }));
    } catch (error) {
      console.log("access device as guest...");
      await errorHandler({ error, doNothing: true });
      db.update((data) => {
        data[user.email][user.env].device = {
          id: "guest",
          uniqueName: "guest",
          serialNumber: serialNumber,
          serialPortPath,
        };
      });
      await oraPromise(() => applyInitSettings(interactiveMode));
      return;
    }
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
    let devices;
    try {
      devices = await oraPromise(() => getDevices({ serialNumber }));
    } catch (error) {
      console.log("access device as guest...");
      await errorHandler({ error, doNothing: true });
      db.update((data) => {
        data[user.email][user.env].device = {
          id: "guest",
          uniqueName: "guest",
          serialNumber: serialNumber,
          serialPortPath,
        };
      });
      await oraPromise(() => applyInitSettings(interactiveMode));
      return;
    }
    device = devices[0];
    if (!device) {
      try {
        device = await oraPromise(() =>
          bindDevice({
            serialNumber,
          }),
        );
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
          await oraPromise(() => applyInitSettings(interactiveMode));
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
  let deviceNameToAssign = device.uniqueName;
  let addToCurrentContext = true;

  if (device.DeviceContext?.length) {
    const deviceContext = device.DeviceContext[0];
    if (deviceContext.Context.id === currentContextId) {
      deviceNameToAssign = deviceContext.assignedDeviceName;
    } else {
      const { name, id } = deviceContext.Context;
      console.log(`Device found in context ${bold(name)}`);
      console.log(`Moving to context ${bold(name)}`);

      db.update((data) => {
        data[user.email][user.env].deviceContext = {
          contextId: id,
          deviceId: device.id,
          assignedDeviceName: deviceContext.assignedDeviceName,
        };
        data[user.email][user.env].context = {
          id,
          name,
        };
      });
      addToCurrentContext = false;
    }
  } else {
    await oraPromise(() =>
      createDeviceContext({
        contextId: currentContextId,
        deviceId: device.id,
        assignedDeviceName: deviceNameToAssign,
      }),
    );
  }

  if (addToCurrentContext) {
    db.update((data) => {
      data[user.email][user.env].deviceContext = {
        contextId: currentContextId,
        deviceId: device.id,
        assignedDeviceName: deviceNameToAssign,
      };
    });
  }

  // set epoch
  await oraPromise(() => applyInitSettings(interactiveMode));
  if (pullConfig) {
    const result = await oraPromise(() =>
      sendCommands(
        [JSON.stringify({ object: "datalogger", action: "get" })],
        false,
      ),
    );
    await oraPromise(() =>
      uploadDataloggerConfig({ ...result[0], object: "datalogger" }),
    );
  }
};
