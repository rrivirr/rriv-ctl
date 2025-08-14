export const SENSOR_CONFIGS = ["sensor", "actuator"];
export const CONFIGS = [...SENSOR_CONFIGS, "telemeter", "datalogger", "board"];

export enum SyncDataType {
  DataloggerConfig = "DataloggerConfig",
  SensorConfig = "SensorConfig",
  ConfigSnapshot = "ConfigSnapshot",
}
