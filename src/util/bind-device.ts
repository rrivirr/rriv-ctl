import * as DeviceApiCalls from "../api/device.ts";
import { Device } from "../api/types.ts";

export const bindDevice = async (body: {
  serialNumber: string;
  accessToken: string;
  uniqueName: string;
}): Promise<Device> => {
  try {
    const device = await DeviceApiCalls.bindDevice({ ...body });
    return device;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    const errorResponse = e?.response?.data;
    if (
      errorResponse &&
      errorResponse.message === "uniquename has been assigned to another device"
    ) {
      console.log("another device has been assigned this name");
      return bindDevice(body);
    }
    throw e;
  }
};
