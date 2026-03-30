import { overwriteConfigSnapshot } from "../../api/config-snapshot.ts";
import { createDataloggerConfig } from "../../api/datalogger.ts";
import { createFirmwareHistoryEntry } from "../../api/device.ts";
import { createSensorConfig } from "../../api/sensor.ts";
import { SyncDataType } from "../../constants.ts";
import db from "../../db/db.ts";
import { errorHandler } from "../../util/error-handler.ts";
import { getActiveUser } from "../../util/get-logged-in-user.ts";

export const syncCommands = async () => {
  const { toSync, email, env } = getActiveUser();

  if (!toSync?.length) {
    console.log("no pending actions to sync");
    return;
  }

  try {
    for (const { requestId, data, type } of toSync) {
      // ignore guest mode data
      if (data.contextId && data.deviceId) {
        if (type === SyncDataType.ConfigSnapshot) {
          await overwriteConfigSnapshot({ ...data });
        } else if (type === SyncDataType.DataloggerConfig) {
          await createDataloggerConfig({ ...data });
        } else if (type === SyncDataType.SensorConfig) {
          await createSensorConfig({ ...data });
        } else if (type === SyncDataType.FirmwareHistory) {
          await createFirmwareHistoryEntry({ ...data });
        }
      }
      db.update((data) => {
        const toSyncData = data[email][env].toSync;
        data[email][env].toSync = toSyncData.filter(
          (d) => d.requestId !== requestId,
        );
      });
    }
    console.log("cloud sync successful");
  } catch (error) {
    console.log("cloud sync failed");
    errorHandler({ error, exit: false });
  }
};
