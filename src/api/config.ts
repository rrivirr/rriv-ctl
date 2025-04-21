import axios from "axios";
import { AccessToken } from "../types.ts";

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

export const getConfigHistory = async (
  body: { deviceId: string; contextId: string } & AccessToken
) => {
  const { accessToken, deviceId, contextId } = body;
  const response = await axios.get(
    `${process.env.MANAGEMENT_API_URL}/configSnapshot/history?deviceId=${deviceId}&contextId=${contextId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};
