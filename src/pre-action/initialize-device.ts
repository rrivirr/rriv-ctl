import { getDevice } from "../api/device.ts";
import db from "../db/db.ts";
import { getConnectedDevice } from "../util/get-connected-device.ts";

export const initializeDevice = async () => {
  const connectedDevice = await getConnectedDevice();
  const { accessToken, device: existingDevice } = db.data;
  const { id, uniqueName, serialNumber } = existingDevice;
  if (!id || !uniqueName || !serialNumber) {
    console.log(
      `no device found, kindly use 'rrivctl connect' to initialize your device`
    );
    process.exit(1);
  }

  const devices = await getDevice({ id, accessToken });
  const device = devices[0];
  if (
    !device ||
    device.uniqueName !== uniqueName ||
    device.serialNumber !== serialNumber ||
    connectedDevice.serialNumber !== device.serialNumber
  ) {
    console.log(
      `no device found, kindly use 'rrivctl connect' to initialize your device`
    );
    process.exit(1);
  } else {
    // check if device context is still valid
    const currentContextId = db.data.context.id;
    const { contextId, deviceId } = db.data.deviceContext;

    if (contextId !== currentContextId || deviceId !== id) {
      console.log(
        `no device found, kindly use 'rrivctl connect' to initialize your device`
      );
      process.exit(1);
    }
    // incase the port path changed
    db.update((data) => {
      data.device.serialPortPath = connectedDevice.serialPortPath;
    });
  }
};
