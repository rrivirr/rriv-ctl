import axios from "axios";
import { AccessToken, Device } from "./types.ts";

export const getDevice = async (body: {
  id?: string;
  serialNumber?: string;
  accessToken: string;
}): Promise<Device[]> => {
  let query = ``;
  const { id, serialNumber, accessToken } = body;

  if (id) {
    query = `id=${id}`;
  } else {
    query = `serialNumber=${serialNumber}`;
  }
  const response = await axios.get(
    `${process.env.RRIV_API_URL}/device?${query}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const getDevices = async (body: {
  accessToken: string;
  contextId?: string;
}): Promise<Device[]> => {
  const { accessToken, contextId } = body;

  const response = await axios.get(`${process.env.RRIV_API_URL}/device`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { contextId },
  });

  return response.data;
};

export const provisionDevice = async (body: {
  uid: string;
  accessToken: string;
}): Promise<Device> => {
  const { uid, accessToken } = body;
  const response = await axios.post(
    `${process.env.RRIV_API_URL}/device`,
    { uid, type: "rriv_0_4_2" },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const bindDevice = async (body: {
  serialNumber: string;
  accessToken: string;
}): Promise<Device> => {
  const { serialNumber, accessToken } = body;
  const response = await axios.post(
    `${process.env.RRIV_API_URL}/device/${serialNumber}/bind`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const unbindDevice = async (
  body: { serialNumber: string } & AccessToken
) => {
  const { serialNumber, accessToken } = body;
  const response = await axios.post(
    `${process.env.RRIV_API_URL}/device/${serialNumber}/unbind`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};
