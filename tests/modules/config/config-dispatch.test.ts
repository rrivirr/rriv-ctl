import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  uploadDataloggerConfig: vi.fn(),
  uploadSensorConfig: vi.fn(),
}));

vi.mock("../../../src/modules/config/datalogger-config.service.ts", () => ({
  uploadDataloggerConfig: mocks.uploadDataloggerConfig,
}));
vi.mock("../../../src/modules/config/sensor-config.service.ts", () => ({
  uploadSensorConfig: mocks.uploadSensorConfig,
}));

import { uploadConfig } from "../../../src/modules/config/config.service.ts";

describe("uploadConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("dispatches datalogger payloads to the datalogger uploader", async () => {
    await uploadConfig({ object: "datalogger" });
    expect(mocks.uploadDataloggerConfig).toHaveBeenCalledWith({
      object: "datalogger",
    });
    expect(mocks.uploadSensorConfig).not.toHaveBeenCalled();
  });

  it("dispatches everything else to the sensor uploader", async () => {
    await uploadConfig({ object: "sensor" });
    expect(mocks.uploadSensorConfig).toHaveBeenCalledWith({ object: "sensor" });
    expect(mocks.uploadDataloggerConfig).not.toHaveBeenCalled();
  });
});
