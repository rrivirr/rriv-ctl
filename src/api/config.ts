import axios from "axios";
import { AccessToken, DeviceContextRequest } from "../types.ts";

export const getDataloggerDrivers = async (body: AccessToken) => {
  const { accessToken } = body;
  const response = await axios.get(
    `${process.env.MANAGEMENT_API_URL}/datalogger/driver`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const getSensorDrivers = async (body: AccessToken) => {
  const { accessToken } = body;
  const response = await axios.get(
    `${process.env.MANAGEMENT_API_URL}/sensor/driver`,
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

export const getConfigHistory = async (body: DeviceContextRequest) => {
  const { accessToken, deviceId, contextId } = body;
  const response = await axios.get(
    `${process.env.MANAGEMENT_API_URL}/configSnapshot/history?deviceId=${deviceId}&contextId=${contextId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const getActiveConfigSnapshot = async (body: DeviceContextRequest) => {
  const { accessToken, deviceId, contextId } = body;
  const response = await axios.get(
    `${process.env.MANAGEMENT_API_URL}/configSnapshot/active?deviceId=${deviceId}&contextId=${contextId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const getConfigSnapshots = async (
  body: { name?: string } & AccessToken
) => {
  const { accessToken, name } = body;
  const response = await axios.get(
    `${process.env.MANAGEMENT_API_URL}/configSnapshot`,
    { headers: { Authorization: `Bearer ${accessToken}` }, params: { name } }
  );

  return response.data;
};

export const saveConfigSnapshot = async (
  body: { name: string } & DeviceContextRequest
) => {
  const { accessToken, name, deviceId, contextId } = body;

  await axios.post(
    `${process.env.MANAGEMENT_API_URL}/configSnapshot/save`,
    { name, deviceId, contextId },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
};
