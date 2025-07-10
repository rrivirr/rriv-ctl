import { overwriteConfigSnapshot } from "../../api/config-snapshot.ts";
import { createDataloggerConfig } from "../../api/datalogger.ts";
import { createSensorConfig } from "../../api/sensor.ts";
import { SyncDataType } from "../../constants.ts";
import db from "../../db/db.ts";
import { errorHandler } from "../../util/error-handler.ts";

export const syncCommands = async (source: "command" | "preAction") => {
  const { accessToken, toSync } = db.data;

  if (!toSync?.length) {
    if (source === "command") {
      console.log("no pending actions to sync");
      process.exit();
    } else {
      return;
    }
  }

  try {
    for (const { requestId, data, type } of toSync) {
      if (type === SyncDataType.ConfigSnapshot) {
        await overwriteConfigSnapshot({ ...data, accessToken });
      } else if (type === SyncDataType.DataloggerConfig) {
        await createDataloggerConfig({ ...data, accessToken });
      } else if (type === SyncDataType.SensorConfig) {
        await createSensorConfig({ ...data, accessToken });
      }
      db.update((data) => {
        const toSyncData = data.toSync;
        data.toSync = toSyncData.filter((d) => d.requestId !== requestId);
      });
    }
    console.log("cloud sync successful");
  } catch (error) {
    console.log("cloud sync failed");
    errorHandler({ error, exit: source === "command" });
  }
};
