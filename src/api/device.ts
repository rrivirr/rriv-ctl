import { Device } from "./types.ts";
import { rrivApiAxios } from "./axios.ts";

export const getDevice = async (body: {
  id?: string;
  serialNumber?: string;
}): Promise<Device[]> => {
  let query = ``;
  const { id, serialNumber } = body;

  if (id) {
    query = `id=${id}`;
  } else {
    query = `serialNumber=${serialNumber}`;
  }
  const response = await rrivApiAxios.get(`/device?${query}`, {});

  return response.data;
};

export const getDevices = async (body: {
  contextId?: string;
}): Promise<Device[]> => {
  const { contextId } = body;

  const response = await rrivApiAxios.get(`/device`, {
    params: { contextId },
  });

  return response.data;
};

export const provisionDevice = async (body: {
  uid: string;
}): Promise<Device> => {
  const { uid } = body;
  const response = await rrivApiAxios.post(`/device`, {
    uid,
    type: "rriv_0_4_2",
  });

  return response.data;
};

export const bindDevice = async (body: {
  serialNumber: string;
}): Promise<Device> => {
  const { serialNumber } = body;
  const response = await rrivApiAxios.post(`/device/${serialNumber}/bind`, {});

  return response.data;
};

export const unbindDevice = async (body: { serialNumber: string }) => {
  const { serialNumber } = body;
  const response = await rrivApiAxios.post(
    `/device/${serialNumber}/unbind`,
    {}
  );

  return response.data;
};

export const createFirmwareHistoryEntry = async (body: {
  version: string;
  installedAt: string;
  deviceId: string;
  contextId: string;
}) => {
  const { version, installedAt, deviceId, contextId } = body;
  await rrivApiAxios.post(`/device/firmware/history`, {
    version,
    installedAt,
    deviceId,
    contextId,
  });
};

export const getFirmwareHistory = async (
  body:
    | {
        deviceId: string;
      }
    | { serialNumber: string }
): Promise<
  {
    version: string;
    installedAt: string;
    createdAt: string;
    contextName: string;
  }[]
> => {
  const response = await rrivApiAxios.get(`/device/firmware/history`, {
    params: body,
  });

  return response.data;
};
