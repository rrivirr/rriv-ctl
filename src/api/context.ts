import { Context, ContextNameRequest } from "./types.ts";
import { rrivApiAxios } from "./axios.ts";

export const getContexts = async (body: {
  ended?: boolean;
  name?: string;
  search?: string;
}): Promise<Context[]> => {
  const { ended, name, search } = body;
  const response = await rrivApiAxios.get(`/context`, {
    params: { ended, name, search },
  });

  return response.data;
};

export const getContextByName = async (
  body: ContextNameRequest,
): Promise<Context> => {
  const { contextName } = body;
  const response = await rrivApiAxios.get(`/context?name=${contextName}`, {});

  return response.data[0];
};

export const createContext = async (
  body: ContextNameRequest,
): Promise<Context> => {
  const { contextName } = body;
  const response = await rrivApiAxios.post(`/context`, { name: contextName });

  return response.data;
};
