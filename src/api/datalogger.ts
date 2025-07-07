import axios from "axios";
import {
  AccessToken,
  ConfigLibrary,
  DataloggerConfigLibraryById,
  Driver,
  CreateDataloggerConfigDto,
} from "./types.ts";

export const getDataloggerDrivers = async (
  body: AccessToken
): Promise<Driver[]> => {
  const { accessToken } = body;
  const response = await axios.get(
    `${process.env.MANAGEMENT_API_URL}/datalogger/driver`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const createDataloggerConfig = async (
  body: CreateDataloggerConfigDto
): Promise<void> => {
  const { accessToken, ...data } = body;
  await axios.post(
    `${process.env.MANAGEMENT_API_URL}/datalogger/config`,
    data,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
};

export const getDataloggerLibraryConfig = async (
  body: { name?: string; search?: string; isPublic?: boolean } & AccessToken
): Promise<ConfigLibrary[]> => {
  const { accessToken, name, search, isPublic } = body;
  const response = await axios.get(
    `${process.env.MANAGEMENT_API_URL}/datalogger/libraryConfig`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { name, search, isPublic },
    }
  );

  return response.data;
};

export const getDataloggerLibraryConfigById = async (
  body: { dataloggerLibraryId: string } & AccessToken
): Promise<DataloggerConfigLibraryById> => {
  const { accessToken, dataloggerLibraryId } = body;
  const response = await axios.get(
    `${process.env.MANAGEMENT_API_URL}/datalogger/libraryConfig/${dataloggerLibraryId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const publishNewDataloggerLibraryConfig = async (
  body: {
    name: string;
    description?: string;
    deviceId: string;
    contextId: string;
  } & AccessToken
): Promise<void> => {
  const { accessToken, name, description, deviceId, contextId } = body;
  await axios.post(
    `${process.env.MANAGEMENT_API_URL}/datalogger/libraryConfig`,
    {
      name,
      description,
      deviceId,
      contextId,
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
};

export const publishNewDataloggerLibraryConfigVersion = async (
  body: {
    description?: string;
    dataloggerLibraryId: string;
    deviceId: string;
    contextId: string;
  } & AccessToken
): Promise<void> => {
  const { accessToken, description, deviceId, contextId, dataloggerLibraryId } =
    body;
  await axios.post(
    `${process.env.MANAGEMENT_API_URL}/datalogger/libraryConfig/${dataloggerLibraryId}/version`,
    {
      description,
      deviceId,
      contextId,
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
};
