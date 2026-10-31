import { beforeEach, describe, expect, it, vi } from "vitest";

const axiosMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}));

vi.mock("../../src/api/axios.ts", () => ({ rrivApiAxios: axiosMock }));

import {
  createContext,
  getContextByName,
  getContexts,
} from "../../src/api/context.ts";
import {
  bindDevice,
  createFirmwareHistoryEntry,
  getDevices,
  provisionDevice,
  registerEui,
} from "../../src/api/device.ts";
import { createSensorConfig, getSensorDrivers } from "../../src/api/sensor.ts";
import {
  createDataloggerConfig,
  getDataloggerDrivers,
} from "../../src/api/datalogger.ts";
import { overwriteConfigSnapshot } from "../../src/api/config-snapshot.ts";
import { createDeviceContext } from "../../src/api/device-context.ts";

describe("api wrappers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.get.mockResolvedValue({ data: [] });
    axiosMock.post.mockResolvedValue({ data: {} });
    axiosMock.put.mockResolvedValue({ data: {} });
  });

  it("context endpoints", async () => {
    await getContexts({ ended: false, name: "n", search: "s" });
    expect(axiosMock.get).toHaveBeenCalledWith("/context", {
      params: { ended: false, name: "n", search: "s" },
    });

    axiosMock.get.mockResolvedValueOnce({ data: [{ id: "1" }] });
    await expect(getContextByName({ contextName: "well" })).resolves.toEqual({
      id: "1",
    });
    expect(axiosMock.get).toHaveBeenCalledWith("/context?name=well", {});

    await createContext({ contextName: "well" });
    expect(axiosMock.post).toHaveBeenCalledWith("/context", { name: "well" });
  });

  it("device endpoints", async () => {
    await getDevices({ contextId: "c1" });
    expect(axiosMock.get).toHaveBeenCalledWith("/device", {
      params: { contextId: "c1" },
    });

    await provisionDevice({ uid: "abc" });
    expect(axiosMock.post).toHaveBeenCalledWith("/device", {
      uid: "abc",
      type: "rriv_0_4_2",
    });

    await bindDevice({ serialNumber: "00001" });
    expect(axiosMock.post).toHaveBeenCalledWith("/device/00001/bind", {});

    await createFirmwareHistoryEntry({
      version: "1.0.0",
      installedAt: "2026-01-01",
      deviceId: "d1",
      contextId: "c1",
    });
    expect(axiosMock.post).toHaveBeenCalledWith("/device/firmware/history", {
      version: "1.0.0",
      installedAt: "2026-01-01",
      deviceId: "d1",
      contextId: "c1",
    });

    await registerEui({ deviceId: "d1", eui: "0102", joinEui: "0304" });
    expect(axiosMock.post).toHaveBeenCalledWith("/device/registerEui", {
      deviceId: "d1",
      eui: "0102",
      joinEui: "0304",
    });
  });

  it("sensor + datalogger endpoints", async () => {
    await getSensorDrivers();
    expect(axiosMock.get).toHaveBeenCalledWith("/sensor/driver");

    const sensorBody = { name: "temp", sensorDriverId: "d" } as never;
    await createSensorConfig(sensorBody);
    expect(axiosMock.post).toHaveBeenCalledWith("/sensor/config", sensorBody);

    await getDataloggerDrivers();
    expect(axiosMock.get).toHaveBeenCalledWith("/datalogger/driver", {});

    const dataloggerBody = { name: "default" } as never;
    await createDataloggerConfig(dataloggerBody);
    expect(axiosMock.post).toHaveBeenCalledWith(
      "/datalogger/config",
      dataloggerBody,
    );
  });

  it("config snapshot + device context endpoints", async () => {
    await overwriteConfigSnapshot({
      dataloggerConfigId: "dl",
      sensorConfigIds: ["s1"],
      deviceId: "d1",
      contextId: "c1",
      createdAt: "2026-01-01",
    } as never);
    expect(axiosMock.put).toHaveBeenCalledWith("/configSnapshot/active", {
      dataloggerConfigId: "dl",
      sensorConfigIds: ["s1"],
      deviceId: "d1",
      contextId: "c1",
      createdAt: "2026-01-01",
    });

    await createDeviceContext({
      deviceId: "d1",
      contextId: "c1",
      assignedDeviceName: "well",
    });
    expect(axiosMock.post).toHaveBeenCalledWith("/context/c1/device/d1", {
      assignedDeviceName: "well",
    });
  });
});
