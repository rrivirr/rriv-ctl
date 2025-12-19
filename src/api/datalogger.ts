import {
  ConfigLibrary,
  DataloggerConfigLibraryById,
  Driver,
  CreateDataloggerConfigDto,
  ConfigHistoryRequest,
  DataloggerConfigHistory,
} from "./types.ts";
import { rrivApiAxios } from "./axios.ts";

export const getDataloggerDrivers = async (): Promise<Driver[]> => {
  const response = await rrivApiAxios.get(`/datalogger/driver`, {});

  return response.data;
};

export const createDataloggerConfig = async (
  body: CreateDataloggerConfigDto
): Promise<void> => {
  await rrivApiAxios.post(`/datalogger/config`, body);
};

export const getDataloggerLibraryConfig = async (body: {
  name?: string;
  search?: string;
  isPublic?: boolean;
}): Promise<ConfigLibrary[]> => {
  const { name, search, isPublic } = body;
  const response = await rrivApiAxios.get(`/datalogger/libraryConfig`, {
    params: { name, search, isPublic },
  });

  return response.data;
};

export const getDataloggerConfigHistory = async (
  body: ConfigHistoryRequest
): Promise<DataloggerConfigHistory[]> => {
  const response = await rrivApiAxios.get(`/datalogger/history`, {
    params: { ...body },
  });

  return response.data;
};

export const getDataloggerLibraryConfigById = async (body: {
  dataloggerLibraryId: string;
}): Promise<DataloggerConfigLibraryById> => {
  const { dataloggerLibraryId } = body;
  const response = await rrivApiAxios.get(
    `/datalogger/libraryConfig/${dataloggerLibraryId}`
  );

  return response.data;
};

export const publishNewDataloggerLibraryConfig = async (body: {
  name: string;
  description?: string;
  deviceId: string;
  contextId: string;
}): Promise<void> => {
  const { name, description, deviceId, contextId } = body;
  await rrivApiAxios.post(`/datalogger/libraryConfig`, {
    name,
    description,
    deviceId,
    contextId,
  });
};

export const publishNewDataloggerLibraryConfigVersion = async (body: {
  description?: string;
  dataloggerLibraryId: string;
  deviceId: string;
  contextId: string;
}): Promise<void> => {
  const { description, deviceId, contextId, dataloggerLibraryId } = body;
  await rrivApiAxios.post(
    `/datalogger/libraryConfig/${dataloggerLibraryId}/version`,
    {
      description,
      deviceId,
      contextId,
    }
  );
};
