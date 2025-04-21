import axios from "axios";
import { IdRequest, Context, ContextNameRequest } from "../types.ts";

export const getContexts = async (body: {
  accessToken: string;
  ended?: boolean;
  name?: string;
}): Promise<Context[]> => {
  const { accessToken, ended, name } = body;
  const response = await axios.get(
    `${process.env.MANAGEMENT_API_URL}/context`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { ended, name },
    }
  );

  return response.data;
};

export const getContextByName = async (
  body: ContextNameRequest
): Promise<Context> => {
  const { contextName, accessToken } = body;
  const response = await axios.get(
    `${process.env.MANAGEMENT_API_URL}/context?name=${contextName}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data[0];
};

export const createContext = async (
  body: ContextNameRequest
): Promise<Context> => {
  const { contextName, accessToken } = body;
  const response = await axios.post(
    `${process.env.MANAGEMENT_API_URL}/context`,
    { name: contextName },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const deleteContext = async (body: IdRequest) => {
  const { id, accessToken } = body;
  const response = await axios.delete(
    `${process.env.MANAGEMENT_API_URL}/context/${id}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const updateContext = async (body: IdRequest & { end?: boolean }) => {
  const { id, accessToken, end } = body;
  const response = await axios.patch(
    `${process.env.MANAGEMENT_API_URL}/context/${id}`,
    { end },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};
