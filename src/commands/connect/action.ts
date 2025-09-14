import { getConnectedDevice } from "../../util/get-connected-device.ts";
import { setDeviceEpoch } from "../../infra/set-device-epoch.ts";
import db from "../../db/db.ts";
import { getDevice } from "../../api/device.ts";
import { bindDevice } from "../../util/bind-device.ts";
import { getDeviceContext } from "../../api/device-context.ts";
import { Device } from "../../api/types.ts";
import { createDeviceContext } from "../../modules/context/device-context.service.ts";
import { uploadDataloggerConfig } from "../../modules/config/datalogger-config.service.ts";
import { waitForReady } from "../../infra/wait-for-ready.ts";

export const connectAction = async (options: any) => {
  const { uniqueName, assignedDeviceName, path } = options;
  // detect the serial port
  let serialNumber,
    serialPortPath,
    wait = false;

  if (path) {
    serialNumber = "default";
    serialPortPath = path;
  } else {
    const connectedDevice = await getConnectedDevice();
    serialNumber = connectedDevice.serialNumber;
    serialPortPath = connectedDevice.serialPortPath;
    wait = connectedDevice.wait;
  }

  const {
    device: {
      id,
      uniqueName: existingUniqueName,
      serialNumber: existingSerialNumber,
    },
    context,
    deviceContext,
    accessToken,
  } = db.data;

  let toBindDevice = false;
  let pullConfig = false;
  let device: Device | undefined;
  if (!id || !existingUniqueName || !existingSerialNumber) {
    toBindDevice = true;
  }

  if (!toBindDevice) {
    const devices = await getDevice({ id, accessToken });
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
    const devices = await getDevice({ serialNumber, accessToken });
    device = devices[0];
    if (!device) {
      console.log("no existing device information found for", serialNumber);
      console.log("binding device to your account...");
      device = await bindDevice({
        accessToken,
        serialNumber,
        uniqueName,
      });
      pullConfig = true;
    }
  }

  if (!device) {
    // should not happen
    throw new Error("Internal server error");
  }

  db.update((data) => {
    data.device = {
      id: device.id,
      uniqueName: device.uniqueName,
      serialNumber: device.serialNumber,
      serialPortPath,
    };
  });

  const { id: currentContextId } = context;
  if (
    !deviceContext ||
    deviceContext.contextId !== currentContextId ||
    deviceContext.deviceId !== device.id
  ) {
    try {
      const currentDeviceContext = await getDeviceContext({
        contextId: currentContextId,
        deviceId: device.id,
        accessToken,
      });

      db.update((data) => {
        data.deviceContext = {
          contextId: currentDeviceContext.contextId,
          deviceId: currentDeviceContext.deviceId,
          assignedDeviceName: currentDeviceContext.assignedDeviceName,
        };
      });
    } catch (error: any) {
      if (error?.response?.data?.code === 404) {
        if (!assignedDeviceName) {
          console.log(
            "device not found in current context, assigned device name flag required"
          );
          return;
        }
        console.log("device not found in current context, adding device...");
        await createDeviceContext({
          contextId: currentContextId,
          deviceId: device.id,
          accessToken,
          assignedDeviceName,
        });

        db.update((data) => {
          data.deviceContext = {
            contextId: currentContextId,
            deviceId: device.id,
            assignedDeviceName,
          };
        });
      } else {
        throw error;
      }
    }
  }

  // set epoch
  if (wait) {
    await waitForReady();
  }
  const dataloggerConfig = await setDeviceEpoch();
  if (pullConfig) {
    await uploadDataloggerConfig({ ...dataloggerConfig, object: "datalogger" });
  }
};
