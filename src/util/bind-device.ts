import * as DeviceApiCalls from "../api/device.ts";
import { Device } from "../api/types.ts";

export const bindDevice = async (body: {
  serialNumber: string;
}): Promise<Device> => {
  const device = await DeviceApiCalls.bindDevice({ ...body });
  return device;
};
