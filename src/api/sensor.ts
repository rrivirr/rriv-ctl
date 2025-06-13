import axios from "axios";
import { AccessToken, ConfigLibrary } from "../types.ts";

export const getSensorDrivers = async (body: AccessToken) => {
  const { accessToken } = body;
  const response = await axios.get(
    `${process.env.MANAGEMENT_API_URL}/sensor/driver`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const createSensorConfig = async (
  body: {
    singlePropertyChange: boolean;
    config: any;
    createdAt: string;
    sensorDriverId: string;
    name: string;
    deviceId: string;
    contextId: string;
  } & AccessToken
) => {
  const { accessToken, ...data } = body;
  const response = await axios.post(
    `${process.env.MANAGEMENT_API_URL}/sensor/config`,
    data,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const getSensorLibraryConfig = async (
  body: { name?: string; search?: string; isPublic?: boolean } & AccessToken
): Promise<ConfigLibrary> => {
  const { accessToken, name, search, isPublic } = body;
  const response = await axios.get(
    `${process.env.MANAGEMENT_API_URL}/sensor/libraryConfig`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { name, search, isPublic },
    }
  );

  return response.data;
};

export const getSensorLibraryConfigById = async (
  body: { sensorLibraryId: string } & AccessToken
) => {
  const { accessToken, sensorLibraryId } = body;
  const response = await axios.get(
    `${process.env.MANAGEMENT_API_URL}/sensor/libraryConfig/${sensorLibraryId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const publishNewSensorLibraryConfig = async (
  body: {
    name: string;
    description?: string;
    sensorConfigId: string;
  } & AccessToken
) => {
  const { accessToken, name, description, sensorConfigId } = body;
  const response = await axios.post(
    `${process.env.MANAGEMENT_API_URL}/sensor/libraryConfig`,
    {
      name,
      description,
      sensorConfigId,
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const publishNewSensorLibraryConfigVersion = async (
  body: {
    description?: string;
    sensorLibraryId: string;
    sensorConfigId: string;
  } & AccessToken
) => {
  const { accessToken, description, sensorConfigId, sensorLibraryId } = body;
  const response = await axios.post(
    `${process.env.MANAGEMENT_API_URL}/sensor/libraryConfig/${sensorLibraryId}/version`,
    {
      description,
      sensorConfigId,
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};
