import { getConnectedDevice } from "../../util/get-connected-device.ts";
import { setDeviceEpoch } from "../../util/set-device-epoch.ts";
import db from "../../db/db.ts";
import { getDevice } from "../../api/device.ts";
import { bindDevice } from "../../util/bind-device.ts";
import { getDeviceContext } from "../../api/device-context.ts";
import { Device } from "../../api/types.ts";
import { createDeviceContext } from "../../modules/context/device-context.service.ts";

export const connectAction = async () => {
  // detect the serial port
  const connectedDevice = await getConnectedDevice();
  const { serialNumber, serialPortPath } = connectedDevice;
  const {
    device: { id, uniqueName, serialNumber: existingSerialNumber },
    context,
    deviceContext,
    accessToken,
  } = db.data;

  let toBindDevice = false;
  let device: Device | undefined;
  if (!id || !uniqueName || !existingSerialNumber) {
    toBindDevice = true;
  }

  if (!toBindDevice) {
    const devices = await getDevice({ id, accessToken });
    const existingDevice = devices[0];

    if (
      !existingDevice ||
      existingDevice.uniqueName !== uniqueName ||
      existingDevice.serialNumber !== serialNumber ||
      connectedDevice.serialNumber !== existingDevice.serialNumber
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
      device = await bindDevice({ accessToken, serialNumber });
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
    } catch (e: any) {
      if (e?.response?.data?.code === 404) {
        console.log("device not found in current context, adding device...");
        const assignedDeviceName = await createDeviceContext({
          contextId: currentContextId,
          deviceId: device.id,
          accessToken,
        });

        db.update((data) => {
          data.deviceContext = {
            contextId: currentContextId,
            deviceId: device.id,
            assignedDeviceName,
          };
        });
      } else {
        throw e;
      }
    }
  }

  // set epoch
  setDeviceEpoch(serialPortPath);
};
