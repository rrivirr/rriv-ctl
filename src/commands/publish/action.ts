import {
  publishConfigSnapshot,
  publishCurrentConfigSnapshot,
} from "../../modules/config/library/config-snapshot.library.ts";
import { publishCurrentDataloggerConfig } from "../../modules/config/library/datalogger-config.library.ts";
import { publishCurrentSensorConfig } from "../../modules/config/library/sensor-config.library.ts";

export const publishAction = async (object: string, options: any) => {
  const { configSnapshotName, libraryConfigName, description, sensor } =
    options;

  //validations
  const validSensors = ["actuator", "sensor"];
  if (object === "current-sensor-config" && !validSensors.includes(sensor)) {
    throw new Error(
      `sensor(-s) option is required for current-sensor-config and must be one of ${validSensors.join(",")}`
    );
  } else if (object !== "current-sensor-config" && sensor) {
    throw new Error(`sensor option is not supported`);
  } else if (object === "config-snapshot" && !configSnapshotName) {
    throw new Error("name of the saved config snapshot to publish is required");
  } else if (object !== "config-snapshot" && configSnapshotName) {
    throw new Error("config-snapshot-name option not supported");
  }

  if (object === "config-snapshot") {
    await publishConfigSnapshot({
      configSnapshotName,
      libraryConfigName,
      description,
    });
  } else if (object === "current-config-snapshot") {
    await publishCurrentConfigSnapshot({
      libraryConfigName,
      description,
    });
  } else if (object === "current-sensor-config") {
    await publishCurrentSensorConfig({
      libraryConfigName,
      description,
      sensor,
    });
  } else if (object === "current-datalogger-config") {
    await publishCurrentDataloggerConfig({
      libraryConfigName,
      description,
    });
  }
};
