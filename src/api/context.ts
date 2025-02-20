import axios from "axios";
import { AccessToken, IdRequest } from "./types.ts";

export type ContextNameRequest = {
  contextName: string;
} & AccessToken;

type Context = {
  id: string;
  name: string;
  accountId: string;
  startedAt: string;
  endedAt: string;
};

export const getContexts = async (accessToken: string): Promise<Context[]> => {
  const response = await axios.get(
    `${process.env.MANAGEMENT_API_URL}/context`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return response.data;
};

export const getContextByName = async (
  body: ContextNameRequest
): Promise<Context[]> => {
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
