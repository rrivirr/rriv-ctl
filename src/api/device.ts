import { Device } from "./types.ts";
import { rrivApiAxios } from "./axios.ts";

export const getDevices = async (body: {
  contextId?: string;
  id?: string;
  serialNumber?: string;
  identifier?: string;
}): Promise<Device[]> => {
  const response = await rrivApiAxios.get(`/device`, {
    params: { ...body },
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
    {},
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
    | { serialNumber: string },
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

export const registerEui = async (body: {
  deviceId: string;
  eui: string;
  joinEui: string;
  application?: string;
}) => {
  await rrivApiAxios.post(`/device/registerEui`, body);
};

export const sendCommand = async (body: {
  command: string;
  identifier: string;
}): Promise<{ responseId: string }> => {
  const response = await rrivApiAxios.post(`/device/sendCommand`, body);
  return response.data;
};

export const createLog = async (body: { log: string; identifier: string }) => {
  await rrivApiAxios.post(`/device/log`, body);
};

export const getLogs = async (query: {
  identifier: string;
}): Promise<
  {
    log: string;
    createdAt: string;
    Creator: { firstName: string; lastName: string };
  }[]
> => {
  const response = await rrivApiAxios.get("/device/log", {
    params: { ...query },
  });
  return response.data;
};
