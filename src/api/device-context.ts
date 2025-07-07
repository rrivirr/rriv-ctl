import axios from "axios";
import { DeviceContext, DeviceContextRequest } from "./types.ts";

export const getDeviceContext = async (
  body: DeviceContextRequest
): Promise<DeviceContext> => {
  const { deviceId, contextId, accessToken } = body;

  const response = await axios.get(
    `${process.env.MANAGEMENT_API_URL}/context/${contextId}/device/${deviceId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const createDeviceContext = async (
  body: DeviceContextRequest & { assignedDeviceName: string }
): Promise<void> => {
  const { deviceId, contextId, accessToken, assignedDeviceName } = body;

  await axios.post(
    `${process.env.MANAGEMENT_API_URL}/context/${contextId}/device/${deviceId}`,
    { assignedDeviceName },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
};

export const updateDeviceContext = async (
  body: DeviceContextRequest & { end?: boolean }
): Promise<void> => {
  const { accessToken, contextId, deviceId, end } = body;

  await axios.patch(
    `${process.env.MANAGEMENT_API_URL}/context/${contextId}/device/${deviceId}`,
    { end },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
};
