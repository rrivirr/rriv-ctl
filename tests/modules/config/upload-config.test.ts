import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSensorConfig: vi.fn(),
  getSensorDrivers: vi.fn(),
  createDataloggerConfig: vi.fn(),
  getDataloggerDrivers: vi.fn(),
  errorHandler: vi.fn(),
}));

vi.mock("../../../src/api/sensor.ts", () => ({
  createSensorConfig: mocks.createSensorConfig,
  getSensorDrivers: mocks.getSensorDrivers,
}));
vi.mock("../../../src/api/datalogger.ts", () => ({
  createDataloggerConfig: mocks.createDataloggerConfig,
  getDataloggerDrivers: mocks.getDataloggerDrivers,
}));
vi.mock("../../../src/util/error-handler.ts", () => ({
  errorHandler: mocks.errorHandler,
}));

import { uploadSensorConfig } from "../../../src/modules/config/sensor-config.service.ts";
import { uploadDataloggerConfig } from "../../../src/modules/config/datalogger-config.service.ts";
import { getActiveUser } from "../../../src/util/get-logged-in-user.ts";
import { seedUser } from "../../helpers/db.ts";

const deviceContext = {
  contextId: "c1",
  deviceId: "d1",
  assignedDeviceName: "well",
};

describe("uploadSensorConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("uploads immediately when there is nothing queued", async () => {
    seedUser({ deviceContext, toSync: [] });
    mocks.getSensorDrivers.mockResolvedValue([{ id: "drv1", name: "ds18b20" }]);

    await uploadSensorConfig({ id: "temp", pin: 4 });

    expect(mocks.createSensorConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "temp",
        sensorDriverId: "drv1",
        deviceId: "d1",
        contextId: "c1",
        config: { pin: 4 },
      }),
    );
    expect(getActiveUser().toSync).toHaveLength(0);
  });

  it("queues instead of uploading when offline items already exist", async () => {
    seedUser({
      deviceContext,
      toSync: [{ requestId: "0", type: "SensorConfig", data: {} } as never],
    });

    await uploadSensorConfig({ id: "temp", pin: 4 });

    expect(mocks.createSensorConfig).not.toHaveBeenCalled();
    expect(getActiveUser().toSync).toHaveLength(2);
  });

  it("queues and reports when the upload fails", async () => {
    seedUser({ deviceContext, toSync: [] });
    mocks.getSensorDrivers.mockResolvedValue([{ id: "drv1", name: "x" }]);
    mocks.createSensorConfig.mockRejectedValue(new Error("boom"));

    await uploadSensorConfig({ id: "temp", pin: 4 });

    expect(mocks.errorHandler).toHaveBeenCalledTimes(1);
    expect(getActiveUser().toSync).toHaveLength(1);
  });

  it("throws when no drivers exist", async () => {
    seedUser({ deviceContext, toSync: [] });
    mocks.getSensorDrivers.mockResolvedValue([]);

    await expect(uploadSensorConfig({ id: "temp" })).rejects.toThrow(
      "no drivers found; contact admin",
    );
  });
});

describe("uploadDataloggerConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("uploads using the provided driver", async () => {
    seedUser({ deviceContext, toSync: [] });

    await uploadDataloggerConfig({ dataloggerDriverId: "dl1", sleep: 300 });

    expect(mocks.createDataloggerConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "datalogger",
        dataloggerDriverId: "dl1",
        deviceId: "d1",
        contextId: "c1",
        config: { sleep: 300 },
      }),
    );
  });

  it("looks up a default driver when none is provided", async () => {
    seedUser({ deviceContext, toSync: [] });
    mocks.getDataloggerDrivers.mockResolvedValue([{ id: "dl-default" }]);

    await uploadDataloggerConfig({ sleep: 60 });

    expect(mocks.createDataloggerConfig).toHaveBeenCalledWith(
      expect.objectContaining({ dataloggerDriverId: "dl-default" }),
    );
  });
});
