import { DeviceContextRequest } from "./types.ts";
import { rrivApiAxios } from "./axios.ts";

export const createDeviceContext = async (
  body: DeviceContextRequest & { assignedDeviceName: string },
): Promise<void> => {
  const { deviceId, contextId, assignedDeviceName } = body;

  await rrivApiAxios.post(`/context/${contextId}/device/${deviceId}`, {
    assignedDeviceName,
  });
};
