import axios from "axios";
import { AccessToken } from "./types.ts";

type DeviceContextRequest = {
  contextId: string;
  deviceId: string;
} & AccessToken;

type DeviceContext = {
  id: string;
  deviceId: string;
  contextId: string;
  assignedDeviceName: string;
  startedAt: string;
  endedAt: string;
};

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
): Promise<DeviceContext> => {
  const { deviceId, contextId, accessToken, assignedDeviceName } = body;

  const response = await axios.post(
    `${process.env.MANAGEMENT_API_URL}/context/${contextId}/device/${deviceId}`,
    { assignedDeviceName },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};
