import { DeviceContext, DeviceContextRequest } from "./types.ts";
import { rrivApiAxios } from "./axios.ts";

export const getDeviceContext = async (
  body: DeviceContextRequest
): Promise<DeviceContext> => {
  const { deviceId, contextId } = body;

  const response = await rrivApiAxios.get(
    `/context/${contextId}/device/${deviceId}`
  );

  return response.data;
};

export const createDeviceContext = async (
  body: DeviceContextRequest & { assignedDeviceName: string }
): Promise<void> => {
  const { deviceId, contextId, assignedDeviceName } = body;

  await rrivApiAxios.post(`/context/${contextId}/device/${deviceId}`, {
    assignedDeviceName,
  });
};

export const updateDeviceContext = async (
  body: DeviceContextRequest & { end: true }
): Promise<void> => {
  const { contextId, deviceId, end } = body;

  await rrivApiAxios.patch(`/context/${contextId}/device/${deviceId}`, { end });
};
