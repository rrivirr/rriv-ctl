import { overwriteConfigSnapshot } from "../../api/config-snapshot.ts";
import { createDataloggerConfig } from "../../api/datalogger.ts";
import { createFirmwareHistoryEntry } from "../../api/device.ts";
import { createSensorConfig } from "../../api/sensor.ts";
import { SyncDataType } from "../../constants.ts";
import db from "../../db/db.ts";
import { errorHandler } from "../../util/error-handler.ts";
import { getActiveUser } from "../../util/get-logged-in-user.ts";

export const syncCommands = async () => {
  // @TODO functionality not fully mapped out
  const { accessToken, toSync, email } = getActiveUser();

  if (!toSync?.length) {
    console.log("no pending actions to sync");
    return;
  }

  try {
    for (const { requestId, data, type } of toSync) {
      if (type === SyncDataType.ConfigSnapshot) {
        await overwriteConfigSnapshot({ ...data, accessToken });
      } else if (type === SyncDataType.DataloggerConfig) {
        await createDataloggerConfig({ ...data, accessToken });
      } else if (type === SyncDataType.SensorConfig) {
        await createSensorConfig({ ...data, accessToken });
      } else if (type === SyncDataType.FirmwareHistory) {
        await createFirmwareHistoryEntry({ ...data, accessToken });
      }
      db.update((data) => {
        const toSyncData = data[email].toSync;
        data[email].toSync = toSyncData.filter(
          (d) => d.requestId !== requestId
        );
      });
    }
    console.log("cloud sync successful");
  } catch (error) {
    console.log("cloud sync failed");
    errorHandler({ error, exit: false });
  }
};
