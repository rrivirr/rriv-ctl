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
  author?: string;
}): Promise<ConfigLibrary[]> => {
  const { name, search, author } = body;
  const response = await rrivApiAxios.get(`/datalogger/libraryConfig`, {
    params: { name, search, author },
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
  config: object;
}): Promise<void> => {
  const { name, description, config } = body;
  await rrivApiAxios.post(`/datalogger/libraryConfig`, {
    name,
    description,
    config,
  });
};

export const publishNewDataloggerLibraryConfigVersion = async (body: {
  description?: string;
  dataloggerLibraryId: string;
  config: object;
}): Promise<void> => {
  const { description, config, dataloggerLibraryId } = body;
  await rrivApiAxios.post(
    `/datalogger/libraryConfig/${dataloggerLibraryId}/version`,
    {
      description,
      config,
    }
  );
};

export const updateDataloggerLibraryConfig = async (body: {
  dataloggerLibraryId: string;
  isPublic: boolean;
}): Promise<void> => {
  const { dataloggerLibraryId, isPublic } = body;
  await rrivApiAxios.patch(`/datalogger/libraryConfig/${dataloggerLibraryId}`, {
    isPublic,
  });
};
