import { createSensorConfig, getSensorDrivers } from "../../api/sensor.ts";
import { selectDriverPrompt } from "../../prompts/config.prompt.ts";
import { DefaultObject } from "../../types.ts";
import db from "../../db/db.ts";
import { logToConsole } from "../../util/console-log.ts";
import { errorHandler } from "../../util/error-handler.ts";
import { randomUUID } from "crypto";

export const uploadSensorConfig = async (payload: DefaultObject) => {
  const {
    accessToken,
    toSync,
    deviceContext: { deviceId, contextId },
  } = db.data;
  const sensorConfigsToSync = toSync?.sensorConfigs;
  const {
    sensorDriverId: receivedSensorDriverId,
    singlePropertyChange,
    ...config
  } = payload;
  let sensorDriverId = receivedSensorDriverId;

  if (!sensorDriverId) {
    const sensorDrivers = await getSensorDrivers({ accessToken });
    if (!sensorDrivers.length) {
      throw new Error("no drivers found; contact admin");
    }
    const sensorDriversIdName: DefaultObject = {};

    const { driverName: sensorDriverName } = await selectDriverPrompt(
      sensorDrivers.map((d) => {
        sensorDriversIdName[d.name] = d.id;
        return d.name;
      })
    );
    sensorDriverId = sensorDriversIdName[sensorDriverName];
  }

  const dataToUpload = {
    name: payload.object,
    sensorDriverId,
    deviceId,
    contextId,
    singlePropertyChange,
    createdAt: new Date().toISOString(),
    config,
  };

  if (sensorConfigsToSync?.length) {
    db.update((data) => {
      data.toSync.sensorConfigs = [
        ...sensorConfigsToSync,
        { requestId: randomUUID(), data: dataToUpload },
      ];
    });
  } else {
    try {
      await createSensorConfig({ ...dataToUpload, accessToken });
      logToConsole("config uploaded to cloud successfully");
    } catch (error) {
      db.update((data) => {
        data.toSync = {
          ...(data.toSync && { ...data.toSync }),
          sensorConfigs: [{ requestId: randomUUID(), data: dataToUpload }],
        };
      });
      logToConsole("cloud upload failed");
      errorHandler({ error, exit: false });
    }
  }
};
