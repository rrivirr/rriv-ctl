import * as DeviceContextApiCalls from "../../api/device-context.ts";
import { assignedDeviceNamePrompt } from "../../prompts/device-context.prompt.ts";
import db from "../../db/db.ts";

export const endDeviceContext = async () => {
  const {
    deviceContext: { deviceId, contextId },
    accessToken,
  } = db.data;

  await DeviceContextApiCalls.updateDeviceContext({
    deviceId,
    contextId,
    accessToken,
    end: true,
  });
  db.update((data) => {
    data.deviceContext = {
      contextId: "",
      deviceId: "",
      assignedDeviceName: "",
    };
  });
};

export const createDeviceContext = async (body: {
  contextId: string;
  deviceId: string;
  accessToken: string;
}) => {
  const { assignedDeviceName } = await assignedDeviceNamePrompt();
  await DeviceContextApiCalls.createDeviceContext({
    ...body,
    assignedDeviceName,
  });
  return assignedDeviceName;
};
