export const SENSOR_CONFIGS = ["sensor", "actuator"] as const;

export const CONFIGS = [
  ...SENSOR_CONFIGS,
  "telemeter",
  "datalogger",
  "board",
] as const;

export const UPDATE_CHANNEL = ["stable", "alpha"] as const;
export type UpdateChannel = (typeof UPDATE_CHANNEL)[number];

export enum SyncDataType {
  DataloggerConfig = "DataloggerConfig",
  SensorConfig = "SensorConfig",
  ConfigSnapshot = "ConfigSnapshot",
}
