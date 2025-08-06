import axios from "axios";
import {
  AccessToken,
  ConfigHistory,
  ConfigLibrary,
  ConfigLibraryById,
  ConfigSnapshot,
  DeviceContextRequest,
  OverwriteConfigSnapshotDto,
} from "./types.ts";

export const getConfigHistory = async (
  body: DeviceContextRequest
): Promise<ConfigHistory> => {
  const { accessToken, deviceId, contextId } = body;
  const response = await axios.get(
    `${process.env.RRIV_API_URL}/configSnapshot/history?deviceId=${deviceId}&contextId=${contextId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const getActiveConfigSnapshot = async (
  body: DeviceContextRequest
): Promise<{
  dataloggerConfig: { config: object };
  sensorConfig: { id: string; name: string; config: object }[];
}> => {
  const { accessToken, deviceId, contextId } = body;
  const response = await axios.get(
    `${process.env.RRIV_API_URL}/configSnapshot/active?deviceId=${deviceId}&contextId=${contextId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const getConfigSnapshots = async (
  body: { name?: string; search?: string } & AccessToken
): Promise<ConfigSnapshot[]> => {
  const { accessToken, name, search } = body;
  const response = await axios.get(
    `${process.env.RRIV_API_URL}/configSnapshot`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { name, search },
    }
  );

  return response.data;
};

export const overwriteConfigSnapshot = async (
  body: OverwriteConfigSnapshotDto
): Promise<void> => {
  const {
    accessToken,
    dataloggerConfigId,
    sensorConfigIds,
    deviceId,
    contextId,
    createdAt,
  } = body;

  await axios.put(
    `${process.env.RRIV_API_URL}/configSnapshot/active`,
    { dataloggerConfigId, sensorConfigIds, deviceId, contextId, createdAt },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
};

export const saveConfigSnapshot = async (
  body: { name: string } & DeviceContextRequest
): Promise<void> => {
  const { accessToken, name, deviceId, contextId } = body;

  await axios.post(
    `${process.env.RRIV_API_URL}/configSnapshot/save`,
    { name, deviceId, contextId },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
};

export const getLibraryConfigSnapshots = async (
  body: { name?: string; search?: string; isPublic?: boolean } & AccessToken
): Promise<ConfigLibrary[]> => {
  const { accessToken, name, search, isPublic } = body;
  const response = await axios.get(
    `${process.env.RRIV_API_URL}/configSnapshot/libraryConfig`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { name, search, isPublic },
    }
  );

  return response.data;
};

export const getLibraryConfigSnapshotById = async (
  body: { libraryConfigSnapshotId: string } & AccessToken
): Promise<ConfigLibraryById> => {
  const { accessToken, libraryConfigSnapshotId } = body;
  const response = await axios.get(
    `${process.env.RRIV_API_URL}/configSnapshot/libraryConfig/${libraryConfigSnapshotId}`,
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
): Promise<void> => {
  const { accessToken, name, description, configSnapshot } = body;
  await axios.post(
    `${process.env.RRIV_API_URL}/configSnapshot/libraryConfig`,
    {
      name,
      description,
      ...configSnapshot,
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
};

export const publishNewConfigSnapshotLibraryVersion = async (
  body: {
    description?: string;
    libraryConfigSnapshotId: string;
    configSnapshot:
      | { configSnapshotId: string }
      | { deviceId: string; contextId: string };
  } & AccessToken
): Promise<void> => {
  const { accessToken, description, configSnapshot, libraryConfigSnapshotId } =
    body;
  await axios.post(
    `${process.env.RRIV_API_URL}/configSnapshot/libraryConfig/${libraryConfigSnapshotId}/version`,
    {
      description,
      ...configSnapshot,
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
};
