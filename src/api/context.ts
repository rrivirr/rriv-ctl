import { IdRequest, Context, ContextNameRequest } from "./types.ts";
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

export const deleteContext = async (body: IdRequest): Promise<void> => {
  const { id } = body;
  await rrivApiAxios.delete(`/context/${id}`);
};

export const updateContext = async (
  body: IdRequest & { end?: boolean },
): Promise<void> => {
  const { id, end } = body;
  await rrivApiAxios.patch(`/context/${id}`, { end });
};

export const shareContext = async (
  body: IdRequest & { email: string },
): Promise<void> => {
  const { id, email } = body;
  await rrivApiAxios.post(`/context/${id}/share `, { email });
};

export const getShareRecipients = async (
  body: IdRequest,
): Promise<
  { id: string; firstName: string; lastName: string; email: string }[]
> => {
  const { id } = body;
  const response = await rrivApiAxios.get(`/context/${id}/share `);
  return response.data;
};

export const getSharedContexts = async () => {
  const response = await rrivApiAxios.get(`/context/shared`);
  return response.data;
};
