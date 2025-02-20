import * as DeviceApiCalls from "../api/device.ts";
import { bindDevicePrompt } from "../prompts/device.prompt.ts";

export const bindDevice = async (body: {
  serialNumber: string;
  accessToken: string;
}): Promise<DeviceApiCalls.Device> => {
  const { uniqueName } = await bindDevicePrompt();

  try {
    const device = await DeviceApiCalls.bindDevice({ ...body, uniqueName });
    return device;
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
