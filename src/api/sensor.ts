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
  isPublic?: boolean;
}): Promise<ConfigLibrary[]> => {
  const { name, search, isPublic } = body;
  const response = await rrivApiAxios.get(`/sensor/libraryConfig`, {
    params: { name, search, isPublic },
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
  sensorConfigId: string;
}): Promise<void> => {
  const { name, description, sensorConfigId } = body;
  await rrivApiAxios.post(`/sensor/libraryConfig`, {
    name,
    description,
    sensorConfigId,
  });
};

export const publishNewSensorLibraryConfigVersion = async (body: {
  description?: string;
  sensorLibraryId: string;
  sensorConfigId: string;
}): Promise<void> => {
  const { description, sensorConfigId, sensorLibraryId } = body;
  await rrivApiAxios.post(`/sensor/libraryConfig/${sensorLibraryId}/version`, {
    description,
    sensorConfigId,
  });
};
