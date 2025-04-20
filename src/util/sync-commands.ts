import { createDataloggerConfig, createSensorConfig } from "../api/config.ts";
import db from "../db/db.ts";
import { errorHandler } from "./error-handler.ts";

export const syncCommands = async (source: "command" | "preAction") => {
  const { accessToken, toSync } = db.data;

  const dataloggerConfigs = toSync?.dataloggerConfigs;
  const sensorConfigs = toSync?.sensorConfigs;

  if (!dataloggerConfigs?.length && !sensorConfigs?.length) {
    if (source === "command") {
      console.log("no pending actions to sync");
      process.exit();
    } else {
      return;
    }
  }

  try {
    for (const { requestId, data } of dataloggerConfigs) {
      await createDataloggerConfig({ ...data, accessToken });
      db.update((data) => {
        const dataloggerConfigs = data.toSync.dataloggerConfigs;
        data.toSync.dataloggerConfigs = dataloggerConfigs.filter(
          (d) => d.requestId !== requestId
        );
      });
    }

    for (const { requestId, data } of sensorConfigs) {
      await createSensorConfig({ ...data, accessToken });
      db.update((data) => {
        const sensorConfigs = data.toSync.sensorConfigs;
        data.toSync.sensorConfigs = sensorConfigs.filter(
          (d) => d.requestId !== requestId
        );
      });
    }
    console.log("success");
  } catch (error) {
    console.log("cloud sync failed");
    errorHandler({ error, exit: source === "command" });
  }
};
