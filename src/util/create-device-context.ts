import * as DeviceContextApiCalls from "../api/device-context.ts";
import { assignedDeviceNamePrompt } from "../prompts/device-context.prompt.ts";

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
