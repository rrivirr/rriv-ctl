import { applySavedConfigSnapshot } from "../../modules/config/config-snapshot.service.ts";
import { applyPublishedConfigSnapshot } from "../../modules/config/library/config-snapshot.library.ts";
import { applyPublishedDataloggerConfig } from "../../modules/config/library/datalogger-config.library.ts";
import { applyPublishedSensorConfig } from "../../modules/config/library/sensor-config.library.ts";

export const applyAction = async (resource: string, options: any) => {
  // v, version flag is used by commander
  const { name, tag } = options;
  const version = +tag;

  if (tag && !version) {
    throw new Error("tag must be a number");
  }

  if (resource === "saved-config-snapshot") {
    await applySavedConfigSnapshot({ name });
  } else if (resource === "published-config-snapshot") {
    await applyPublishedConfigSnapshot({ name, version });
  } else if (resource === "published-sensor-config") {
    await applyPublishedSensorConfig({ name, version });
  } else if (resource === "published-datalogger-config") {
    await applyPublishedDataloggerConfig({ name, version });
  }
};
