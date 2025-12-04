import { getConnectedDevice } from "../../util/get-connected-device.ts";
import { setDeviceEpoch } from "../../infra/set-device-epoch.ts";
import db from "../../db/db.ts";
import { getDevice } from "../../api/device.ts";
import { bindDevice } from "../../util/bind-device.ts";
import { Device } from "../../api/types.ts";
import { createDeviceContext } from "../../modules/context/device-context.service.ts";
import { uploadDataloggerConfig } from "../../modules/config/datalogger-config.service.ts";
import { waitForReady } from "../../infra/wait-for-ready.ts";
import { bold, italic } from "yoctocolors";
import { getActiveUser } from "../../util/get-logged-in-user.ts";

export const connectAction = async (options: any) => {
  const { assignedDeviceName, path, fromRunCheck } = options;

  const connectedDevice = await getConnectedDevice({
    specifiedSerialPortPath: path,
    fromRunCheck,
  });
  const serialNumber = connectedDevice!.serialNumber;
  const serialPortPath = connectedDevice!.serialPortPath;
  const wait = connectedDevice!.wait;

  const user = getActiveUser();
  const {
    device: {
      id,
      uniqueName: existingUniqueName,
      serialNumber: existingSerialNumber,
    },
    context,
    accessToken,
  } = user;

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
      device = await bindDevice({
        accessToken,
        serialNumber,
      });
      pullConfig = true;
    }
  }

  if (!device) {
    // should not happen
    throw new Error("Internal server error");
  }

  db.update((data) => {
    data[user.email].device = {
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
        `device already in another context: ${bold(deviceContext.Context.name)}`
      );
    }
  } else if (!assignedDeviceName) {
    throw new Error(
      `device yet to be added to current context\nrun ${italic("rrivctlv2 connect --assigned-device-name <name to assign device in current context>")}`
    );
  } else {
    await createDeviceContext({
      contextId: currentContextId,
      deviceId: device.id,
      accessToken,
      assignedDeviceName,
    });
  }

  db.update((data) => {
    data[user.email].deviceContext = {
      contextId: currentContextId,
      deviceId: device.id,
      assignedDeviceName: deviceNameToAssign,
    };
  });

  // set epoch
  if (wait) {
    await waitForReady();
  }
  const dataloggerConfig = await setDeviceEpoch();
  if (pullConfig) {
    await uploadDataloggerConfig({ ...dataloggerConfig, object: "datalogger" });
  }
};
