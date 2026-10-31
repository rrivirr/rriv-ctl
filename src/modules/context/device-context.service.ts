import * as DeviceContextApiCalls from "../../api/device-context.ts";

export const createDeviceContext = async (body: {
  contextId: string;
  deviceId: string;
  assignedDeviceName: string;
}) => {
  await DeviceContextApiCalls.createDeviceContext({
    ...body,
  });
};
