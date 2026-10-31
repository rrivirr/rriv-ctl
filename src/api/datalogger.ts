import { CreateDataloggerConfigDto, Driver } from "./types.ts";
import { rrivApiAxios } from "./axios.ts";

export const getDataloggerDrivers = async (): Promise<Driver[]> => {
  const response = await rrivApiAxios.get(`/datalogger/driver`, {});

  return response.data;
};

export const createDataloggerConfig = async (
  body: CreateDataloggerConfigDto,
): Promise<void> => {
  await rrivApiAxios.post(`/datalogger/config`, body);
};
