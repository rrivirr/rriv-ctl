import { SENSOR_CONFIGS, CONFIGS, SyncDataType } from "./constants.ts";

describe("Constants", () => {
  it("SENSOR_CONFIGS", () => {
    expect(SENSOR_CONFIGS).toHaveLength(2);
    expect(SENSOR_CONFIGS).toEqual(
      expect.arrayContaining(["sensor", "actuator"])
    );
  });

  it("CONFIGS", () => {
    expect(CONFIGS).toHaveLength(4);
    expect(CONFIGS).toEqual(
      expect.arrayContaining(["sensor", "actuator", "datalogger", "board"])
    );
  });

  it("SyncDataType Enum", () => {
    expect(SyncDataType.DataloggerConfig).toBe("DataloggerConfig");
    expect(SyncDataType.SensorConfig).toBe("SensorConfig");
    expect(SyncDataType.ConfigSnapshot).toBe("ConfigSnapshot");

    const enumValues = Object.values(SyncDataType);
    expect(enumValues).toHaveLength(3);
  });
});
