import { randomUUID } from "crypto";
import * as DeviceApiCalls from "../api/device.ts";
import { Device } from "../api/types.ts";
import * as bindDevicePromptModule from "../prompts/device.prompt.ts";
import { bindDevice } from "./bind-device.ts";

describe("bindDevice", () => {
  const bindDeviceSpy = jest.spyOn(DeviceApiCalls, "bindDevice");
  const bindDevicePromptSpy = jest.spyOn(
    bindDevicePromptModule,
    "bindDevicePrompt"
  );
  const consoleLogSpy = jest.spyOn(console, "log");

  it("should bind device", async () => {
    const uniqueName = randomUUID();
    const serialNumber = randomUUID();
    const accessToken = randomUUID();
    const device: Device = {
      id: randomUUID(),
      serialNumber,
      uniqueName,
      createdAt: new Date().toISOString(),
    };
    bindDeviceSpy.mockResolvedValue(device);
    bindDevicePromptSpy.mockResolvedValue({
      uniqueName,
    });

    const result = await bindDevice({
      serialNumber,
      accessToken,
    });

    expect(result).toEqual(device);
    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(bindDevicePromptSpy).toHaveBeenCalledTimes(1);
    expect(bindDeviceSpy).toHaveBeenCalledTimes(1);
    expect(bindDeviceSpy).toHaveBeenCalledWith({
      uniqueName,
      serialNumber,
      accessToken,
    });
  });

  it("should bind device; multiple uniquenames; duplicate uniquenames", async () => {
    const uniqueName1 = randomUUID();
    const uniqueName2 = randomUUID();
    const uniqueName3 = randomUUID();
    const serialNumber = randomUUID();
    const accessToken = randomUUID();
    const device: Device = {
      id: randomUUID(),
      serialNumber,
      uniqueName: uniqueName3,
      createdAt: new Date().toISOString(),
    };
    bindDeviceSpy
      .mockRejectedValueOnce({
        response: {
          data: { message: "uniquename has been assigned to another device" },
        },
      })
      .mockRejectedValueOnce({
        response: {
          data: { message: "uniquename has been assigned to another device" },
        },
      })
      .mockResolvedValueOnce(device);
    bindDevicePromptSpy
      .mockResolvedValueOnce({
        uniqueName: uniqueName1,
      })
      .mockResolvedValueOnce({ uniqueName: uniqueName2 })
      .mockResolvedValueOnce({ uniqueName: uniqueName3 });

    const result = await bindDevice({
      serialNumber,
      accessToken,
    });

    expect(result).toEqual(device);
    expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    expect(bindDevicePromptSpy).toHaveBeenCalledTimes(3);
    expect(bindDeviceSpy).toHaveBeenCalledTimes(3);
    expect(consoleLogSpy).toHaveBeenNthCalledWith(
      1,
      "another device has been assigned this name"
    );
    expect(consoleLogSpy).toHaveBeenNthCalledWith(
      1,
      "another device has been assigned this name"
    );
    expect(bindDeviceSpy).toHaveBeenNthCalledWith(1, {
      uniqueName: uniqueName1,
      serialNumber,
      accessToken,
    });
    expect(bindDeviceSpy).toHaveBeenNthCalledWith(2, {
      uniqueName: uniqueName2,
      serialNumber,
      accessToken,
    });
    expect(bindDeviceSpy).toHaveBeenNthCalledWith(3, {
      uniqueName: uniqueName3,
      serialNumber,
      accessToken,
    });
  });

  it("should throw an error", async () => {
    const serialNumber = randomUUID();
    const uniqueName = randomUUID();
    const accessToken = randomUUID();
    bindDeviceSpy.mockRejectedValue("error 418");
    bindDevicePromptSpy.mockResolvedValue({
      uniqueName,
    });

    await expect(async () => {
      await bindDevice({
        serialNumber,
        accessToken,
      });
    }).rejects.toMatch("error 418");
    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(bindDevicePromptSpy).toHaveBeenCalledTimes(1);
    expect(bindDeviceSpy).toHaveBeenCalledTimes(1);
    expect(bindDeviceSpy).toHaveBeenCalledWith({
      uniqueName,
      serialNumber,
      accessToken,
    });
  });
});
