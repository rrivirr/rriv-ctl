import {
  applyConfigHistory,
  applySavedConfigSnapshot,
} from "../../modules/config/config-snapshot.service.ts";
import { applyPublishedConfigSnapshot } from "../../modules/config/library/config-snapshot.library.ts";
import { applyPublishedDataloggerConfig } from "../../modules/config/library/datalogger-config.library.ts";
import { applyPublishedSensorConfig } from "../../modules/config/library/sensor-config.library.ts";

export const applyAction = async (
  resource: string,
  nameOrTimestamp: string,
  options: any
) => {
  // v, version flag is used by commander
  const { tag } = options;
  const version = +tag;

  if (tag && !version) {
    throw new Error("tag must be a number");
  }

  if (resource === "saved-config-snapshot") {
    await applySavedConfigSnapshot({ name: nameOrTimestamp });
  } else if (resource === "config-history") {
    if (!+new Date(nameOrTimestamp)) {
      throw new Error(`${nameOrTimestamp} must be a valid date`);
    }
    await applyConfigHistory({ timestamp: nameOrTimestamp });
  } else if (resource === "published-config-snapshot") {
    await applyPublishedConfigSnapshot({ name: nameOrTimestamp, version });
  } else if (resource === "published-sensor-config") {
    await applyPublishedSensorConfig({ name: nameOrTimestamp, version });
  } else if (resource === "published-datalogger-config") {
    await applyPublishedDataloggerConfig({ name: nameOrTimestamp, version });
  }
};
