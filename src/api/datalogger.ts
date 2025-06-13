import axios from "axios";
import { AccessToken, ConfigLibrary } from "../types.ts";

export const getDataloggerDrivers = async (body: AccessToken) => {
  const { accessToken } = body;
  const response = await axios.get(
    `${process.env.MANAGEMENT_API_URL}/datalogger/driver`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const createDataloggerConfig = async (
  body: {
    singlePropertyChange: boolean;
    config: any;
    createdAt: string;
    dataloggerDriverId: string;
    name: string;
    deviceId: string;
    contextId: string;
  } & AccessToken
) => {
  const { accessToken, ...data } = body;
  const response = await axios.post(
    `${process.env.MANAGEMENT_API_URL}/datalogger/config`,
    data,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const getDataloggerLibraryConfig = async (
  body: { name?: string; search?: string; isPublic?: boolean } & AccessToken
): Promise<ConfigLibrary> => {
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
) => {
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
) => {
  const { accessToken, name, description, deviceId, contextId } = body;
  const response = await axios.post(
    `${process.env.MANAGEMENT_API_URL}/datalogger/libraryConfig`,
    {
      name,
      description,
      deviceId,
      contextId,
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const publishNewDataloggerLibraryConfigVersion = async (
  body: {
    description?: string;
    dataloggerLibraryId: string;
    deviceId: string;
    contextId: string;
  } & AccessToken
) => {
  const { accessToken, description, deviceId, contextId, dataloggerLibraryId } =
    body;
  const response = await axios.post(
    `${process.env.MANAGEMENT_API_URL}/datalogger/libraryConfig/${dataloggerLibraryId}/version`,
    {
      description,
      deviceId,
      contextId,
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};
