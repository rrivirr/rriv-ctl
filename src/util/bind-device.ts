import * as DeviceApiCalls from "../api/device.ts";
import { Device } from "../api/types.ts";

export const bindDevice = async (body: {
  serialNumber: string;
}): Promise<Device> => {
  const device = await DeviceApiCalls.bindDevice({ ...body });
  await new Promise((r) => setTimeout(r, 3000)); // wait time for auth service sync
  return device;
};
