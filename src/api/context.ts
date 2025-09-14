import axios from "axios";
import { IdRequest, Context, ContextNameRequest } from "./types.ts";

export const getContexts = async (body: {
  accessToken: string;
  ended?: boolean;
  name?: string;
  search?: string;
}): Promise<Context[]> => {
  const { accessToken, ended, name, search } = body;
  const response = await axios.get(`${process.env.RRIV_API_URL}/context`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { ended, name, search },
  });

  return response.data;
};

export const getContextByName = async (
  body: ContextNameRequest
): Promise<Context> => {
  const { contextName, accessToken } = body;
  const response = await axios.get(
    `${process.env.RRIV_API_URL}/context?name=${contextName}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data[0];
};

export const createContext = async (
  body: ContextNameRequest
): Promise<Context> => {
  const { contextName, accessToken } = body;
  const response = await axios.post(
    `${process.env.RRIV_API_URL}/context`,
    { name: contextName },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const deleteContext = async (body: IdRequest): Promise<void> => {
  const { id, accessToken } = body;
  await axios.delete(`${process.env.RRIV_API_URL}/context/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
};

export const updateContext = async (
  body: IdRequest & { end?: boolean }
): Promise<void> => {
  const { id, accessToken, end } = body;
  await axios.patch(
    `${process.env.RRIV_API_URL}/context/${id}`,
    { end },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
};
