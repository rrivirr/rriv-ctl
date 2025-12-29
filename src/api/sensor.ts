import {
  ConfigHistoryRequest,
  ConfigLibrary,
  CreateSensorConfigDto,
  Driver,
  SensorConfigHistory,
  SensorConfigLibraryById,
} from "./types.ts";
import { rrivApiAxios } from "./axios.ts";

export const getSensorDrivers = async (): Promise<Driver[]> => {
  const response = await rrivApiAxios.get(`/sensor/driver`);

  return response.data;
};

export const createSensorConfig = async (
  body: CreateSensorConfigDto
): Promise<void> => {
  await rrivApiAxios.post(`/sensor/config`, body);
};

export const getSensorConfigHistory = async (
  body: ConfigHistoryRequest
): Promise<SensorConfigHistory[]> => {
  const response = await rrivApiAxios.get(`/sensor/history`, {
    params: { ...body },
  });

  return response.data;
};

export const getSensorLibraryConfig = async (body: {
  name?: string;
  search?: string;
  author?: string;
}): Promise<ConfigLibrary[]> => {
  const { name, search, author } = body;
  const response = await rrivApiAxios.get(`/sensor/libraryConfig`, {
    params: { name, search, author },
  });

  return response.data;
};

export const getSensorLibraryConfigById = async (body: {
  sensorLibraryId: string;
}): Promise<SensorConfigLibraryById> => {
  const { sensorLibraryId } = body;
  const response = await rrivApiAxios.get(
    `/sensor/libraryConfig/${sensorLibraryId}`
  );

  return response.data;
};

export const publishNewSensorLibraryConfig = async (body: {
  name: string;
  description?: string;
  config: object;
}): Promise<void> => {
  const { name, description, config } = body;
  await rrivApiAxios.post(`/sensor/libraryConfig`, {
    name,
    description,
    config,
  });
};

export const publishNewSensorLibraryConfigVersion = async (body: {
  description?: string;
  sensorLibraryId: string;
  config: object;
  sensorName: string;
}): Promise<void> => {
  const { description, config, sensorLibraryId, sensorName } = body;
  await rrivApiAxios.post(`/sensor/libraryConfig/${sensorLibraryId}/version`, {
    description,
    sensorName,
    config,
  });
};

export const updateSensorLibraryConfig = async (body: {
  sensorLibraryId: string;
  isPublic: boolean;
}): Promise<void> => {
  const { sensorLibraryId, isPublic } = body;
  await rrivApiAxios.patch(`/sensor/libraryConfig/${sensorLibraryId}`, {
    isPublic,
  });
};
