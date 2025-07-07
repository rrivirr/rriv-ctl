import axios from "axios";
import {
  AccessToken,
  ConfigLibrary,
  CreateSensorConfigDto,
  Driver,
  SensorConfigLibraryById,
} from "./types.ts";

export const getSensorDrivers = async (
  body: AccessToken
): Promise<Driver[]> => {
  const { accessToken } = body;
  const response = await axios.get(
    `${process.env.MANAGEMENT_API_URL}/sensor/driver`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const createSensorConfig = async (
  body: CreateSensorConfigDto
): Promise<void> => {
  const { accessToken, ...data } = body;
  await axios.post(`${process.env.MANAGEMENT_API_URL}/sensor/config`, data, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
};

export const getSensorLibraryConfig = async (
  body: { name?: string; search?: string; isPublic?: boolean } & AccessToken
): Promise<ConfigLibrary[]> => {
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
): Promise<SensorConfigLibraryById> => {
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
): Promise<void> => {
  const { accessToken, name, description, sensorConfigId } = body;
  await axios.post(
    `${process.env.MANAGEMENT_API_URL}/sensor/libraryConfig`,
    {
      name,
      description,
      sensorConfigId,
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
};

export const publishNewSensorLibraryConfigVersion = async (
  body: {
    description?: string;
    sensorLibraryId: string;
    sensorConfigId: string;
  } & AccessToken
): Promise<void> => {
  const { accessToken, description, sensorConfigId, sensorLibraryId } = body;
  await axios.post(
    `${process.env.MANAGEMENT_API_URL}/sensor/libraryConfig/${sensorLibraryId}/version`,
    {
      description,
      sensorConfigId,
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
};
