import axios from "axios";
import { Device } from "../types.ts";

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
    `${process.env.MANAGEMENT_API_URL}/device?${query}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const bindDevice = async (body: {
  uniqueName: string;
  serialNumber: string;
  accessToken: string;
}): Promise<Device> => {
  const { uniqueName, serialNumber, accessToken } = body;
  const response = await axios.post(
    `${process.env.MANAGEMENT_API_URL}/device/${serialNumber}/bind`,
    { uniqueName },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};
