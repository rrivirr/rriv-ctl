import {
  ConfigHistory,
  ConfigLibrary,
  ConfigLibraryById,
  ConfigSnapshot,
  DeviceContextRequest,
  OverwriteConfigSnapshotDto,
  ConfigHistoryRequest,
} from "./types.ts";
import { rrivApiAxios } from "./axios.ts";

export const getConfigHistory = async (
  body: ConfigHistoryRequest
): Promise<ConfigHistory> => {
  const response = await rrivApiAxios.get(`/configSnapshot/history`, {
    params: { ...body },
  });

  return response.data;
};

export const getActiveConfigSnapshot = async (
  body: DeviceContextRequest
): Promise<{
  dataloggerConfig: { config: object };
  sensorConfig: { id: string; name: string; config: object }[];
}> => {
  const { deviceId, contextId } = body;
  const response = await rrivApiAxios.get(
    `/configSnapshot/active?deviceId=${deviceId}&contextId=${contextId}`
  );

  return response.data;
};

export const getConfigSnapshots = async (body: {
  name?: string;
  search?: string;
}): Promise<ConfigSnapshot[]> => {
  const { name, search } = body;
  const response = await rrivApiAxios.get(`/configSnapshot`, {
    params: { name, search },
  });

  return response.data;
};

export const overwriteConfigSnapshot = async (
  body: OverwriteConfigSnapshotDto
): Promise<void> => {
  const {
    dataloggerConfigId,
    sensorConfigIds,
    deviceId,
    contextId,
    createdAt,
  } = body;

  await rrivApiAxios.put(`/configSnapshot/active`, {
    dataloggerConfigId,
    sensorConfigIds,
    deviceId,
    contextId,
    createdAt,
  });
};

export const saveConfigSnapshot = async (
  body: { name: string } & DeviceContextRequest
): Promise<void> => {
  const { name, deviceId, contextId } = body;

  await rrivApiAxios.post(`/configSnapshot/save`, {
    name,
    deviceId,
    contextId,
  });
};

export const getLibraryConfigSnapshots = async (body: {
  name?: string;
  search?: string;
  isPublic?: boolean;
}): Promise<ConfigLibrary[]> => {
  const { name, search, isPublic } = body;
  const response = await rrivApiAxios.get(`/configSnapshot/libraryConfig`, {
    params: { name, search, isPublic },
  });

  return response.data;
};

export const getLibraryConfigSnapshotById = async (body: {
  libraryConfigSnapshotId: string;
}): Promise<ConfigLibraryById> => {
  const { libraryConfigSnapshotId } = body;
  const response = await rrivApiAxios.get(
    `/configSnapshot/libraryConfig/${libraryConfigSnapshotId}`
  );

  return response.data;
};

export const publishNewConfigSnapshotLibrary = async (body: {
  name: string;
  description?: string;
  configSnapshot:
    | { configSnapshotId: string }
    | { deviceId: string; contextId: string };
}): Promise<void> => {
  const { name, description, configSnapshot } = body;
  await rrivApiAxios.post(`/configSnapshot/libraryConfig`, {
    name,
    description,
    ...configSnapshot,
  });
};

export const publishNewConfigSnapshotLibraryVersion = async (body: {
  description?: string;
  libraryConfigSnapshotId: string;
  configSnapshot:
    | { configSnapshotId: string }
    | { deviceId: string; contextId: string };
}): Promise<void> => {
  const { description, configSnapshot, libraryConfigSnapshotId } = body;
  await rrivApiAxios.post(
    `/configSnapshot/libraryConfig/${libraryConfigSnapshotId}/version`,
    {
      description,
      ...configSnapshot,
    }
  );
};
