import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  overwriteConfigSnapshot: vi.fn(),
  createDataloggerConfig: vi.fn(),
  createSensorConfig: vi.fn(),
  createFirmwareHistoryEntry: vi.fn(),
}));

vi.mock("../../../src/api/config-snapshot.ts", () => ({
  overwriteConfigSnapshot: mocks.overwriteConfigSnapshot,
}));
vi.mock("../../../src/api/datalogger.ts", () => ({
  createDataloggerConfig: mocks.createDataloggerConfig,
}));
vi.mock("../../../src/api/sensor.ts", () => ({
  createSensorConfig: mocks.createSensorConfig,
}));
vi.mock("../../../src/api/device.ts", () => ({
  createFirmwareHistoryEntry: mocks.createFirmwareHistoryEntry,
}));

import { SyncDataType } from "../../../src/constants.ts";
import { syncCommands } from "../../../src/modules/config/sync-commands.ts";
import { getActiveUser } from "../../../src/util/get-logged-in-user.ts";
import { seedUser } from "../../helpers/db.ts";

const item = (
  type: SyncDataType,
  data: Record<string, unknown>,
  requestId: string,
) => ({ requestId, type, data }) as never;

describe("syncCommands", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("dispatches each pending item by type and clears toSync", async () => {
    seedUser({
      toSync: [
        item(SyncDataType.SensorConfig, { deviceId: "d1", contextId: "c1" }, "1"),
        item(SyncDataType.DataloggerConfig, { deviceId: "d1", contextId: "c1" }, "2"),
        item(SyncDataType.ConfigSnapshot, { deviceId: "d1", contextId: "c1" }, "3"),
        item(SyncDataType.FirmwareHistory, { deviceId: "d1", contextId: "c1" }, "4"),
      ],
    });

    await syncCommands();

    expect(mocks.createSensorConfig).toHaveBeenCalledTimes(1);
    expect(mocks.createDataloggerConfig).toHaveBeenCalledTimes(1);
    expect(mocks.overwriteConfigSnapshot).toHaveBeenCalledTimes(1);
    expect(mocks.createFirmwareHistoryEntry).toHaveBeenCalledTimes(1);
    expect(getActiveUser().toSync).toHaveLength(0);
  });

  it("skips items without a device and context but still clears them", async () => {
    seedUser({
      toSync: [item(SyncDataType.SensorConfig, {}, "x")],
    });

    await syncCommands();

    expect(mocks.createSensorConfig).not.toHaveBeenCalled();
    expect(getActiveUser().toSync).toHaveLength(0);
  });

  it("does nothing when there is nothing to sync", async () => {
    seedUser({ toSync: [] });

    await syncCommands();

    expect(mocks.createSensorConfig).not.toHaveBeenCalled();
  });
});
