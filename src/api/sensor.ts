import { CreateSensorConfigDto, Driver } from "./types.ts";
import { rrivApiAxios } from "./axios.ts";

export const getSensorDrivers = async (): Promise<Driver[]> => {
  const response = await rrivApiAxios.get(`/sensor/driver`);

  return response.data;
};

export const createSensorConfig = async (
  body: CreateSensorConfigDto,
): Promise<void> => {
  await rrivApiAxios.post(`/sensor/config`, body);
};
