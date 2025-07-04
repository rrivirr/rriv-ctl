import axios from "axios";
import { AccessToken, ConfigLibrary, DeviceContextRequest } from "../types.ts";

export const getConfigHistory = async (body: DeviceContextRequest) => {
  const { accessToken, deviceId, contextId } = body;
  const response = await axios.get(
    `${process.env.MANAGEMENT_API_URL}/configSnapshot/history?deviceId=${deviceId}&contextId=${contextId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const getActiveConfigSnapshot = async (
  body: DeviceContextRequest
): Promise<{
  dataloggerConfig: { config: any };
  sensorConfig: Array<{ id: string; name: string; config: any }>;
}> => {
  const { accessToken, deviceId, contextId } = body;
  const response = await axios.get(
    `${process.env.MANAGEMENT_API_URL}/configSnapshot/active?deviceId=${deviceId}&contextId=${contextId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const getConfigSnapshots = async (
  body: { name?: string; search?: string } & AccessToken
) => {
  const { accessToken, name, search } = body;
  const response = await axios.get(
    `${process.env.MANAGEMENT_API_URL}/configSnapshot`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { name, search },
    }
  );

  return response.data;
};

export const overwriteConfigSnapshot = async (
  body: {
    dataloggerConfigId?: string;
    sensorConfigIds: string[];
  } & DeviceContextRequest
) => {
  const {
    accessToken,
    dataloggerConfigId,
    sensorConfigIds,
    deviceId,
    contextId,
  } = body;

  await axios.put(
    `${process.env.MANAGEMENT_API_URL}/configSnapshot/active`,
    { dataloggerConfigId, sensorConfigIds, deviceId, contextId },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
};

export const saveConfigSnapshot = async (
  body: { name: string } & DeviceContextRequest
) => {
  const { accessToken, name, deviceId, contextId } = body;

  await axios.post(
    `${process.env.MANAGEMENT_API_URL}/configSnapshot/save`,
    { name, deviceId, contextId },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
};

export const getLibraryConfigSnapshots = async (
  body: { name?: string; search?: string; isPublic?: boolean } & AccessToken
): Promise<ConfigLibrary> => {
  const { accessToken, name, search, isPublic } = body;
  const response = await axios.get(
    `${process.env.MANAGEMENT_API_URL}/configSnapshot/libraryConfig`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { name, search, isPublic },
    }
  );

  return response.data;
};

export const getLibraryConfigSnapshotById = async (
  body: { libraryConfigSnapshotId: string } & AccessToken
) => {
  const { accessToken, libraryConfigSnapshotId } = body;
  const response = await axios.get(
    `${process.env.MANAGEMENT_API_URL}/configSnapshot/libraryConfig/${libraryConfigSnapshotId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const publishNewConfigSnapshotLibrary = async (
  body: {
    name: string;
    description?: string;
    configSnapshot:
      | { configSnapshotId: string }
      | { deviceId: string; contextId: string };
  } & AccessToken
) => {
  const { accessToken, name, description, configSnapshot } = body;
  const response = await axios.post(
    `${process.env.MANAGEMENT_API_URL}/configSnapshot/libraryConfig`,
    {
      name,
      description,
      ...configSnapshot,
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const publishNewConfigSnapshotLibraryVersion = async (
  body: {
    description?: string;
    libraryConfigSnapshotId: string;
    configSnapshot:
      | { configSnapshotId: string }
      | { deviceId: string; contextId: string };
  } & AccessToken
) => {
  const { accessToken, description, configSnapshot, libraryConfigSnapshotId } =
    body;
  const response = await axios.post(
    `${process.env.MANAGEMENT_API_URL}/configSnapshot/libraryConfig/${libraryConfigSnapshotId}/version`,
    {
      description,
      ...configSnapshot,
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};
