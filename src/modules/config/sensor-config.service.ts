import { createSensorConfig, getSensorDrivers } from "../../api/sensor.ts";
import { DefaultObject } from "../../types.ts";
import db from "../../db/db.ts";
import { errorHandler } from "../../util/error-handler.ts";
import { randomUUID } from "crypto";
import { SyncDataType } from "../../constants.ts";
import { getActiveUser } from "../../util/get-logged-in-user.ts";

export const uploadSensorConfig = async (payload: DefaultObject) => {
  const {
    toSync,
    deviceContext: { deviceId, contextId },
    email,
    env,
  } = getActiveUser();
  const { sensorDriverId: receivedSensorDriverId, id, ...config } = payload;
  let sensorDriverId = receivedSensorDriverId;

  if (!sensorDriverId) {
    const sensorDrivers = await getSensorDrivers();
    if (!sensorDrivers.length) {
      throw new Error("no drivers found; contact admin");
    }

    // @TODO finalize functionality
    // const sensorDriversIdName: DefaultObject = {};
    // const { driverName: sensorDriverName } = await selectDriverPrompt(
    //   sensorDrivers.map((d) => {
    //     sensorDriversIdName[d.name] = d.id;
    //     return d.name;
    //   })
    // );
    sensorDriverId = sensorDrivers[0].id;
  }

  const dataToUpload = {
    name: id,
    sensorDriverId,
    deviceId,
    contextId,
    singlePropertyChange: false,
    createdAt: new Date().toISOString(),
    config,
  };

  if (toSync?.length) {
    db.update((data) => {
      data[email][env].toSync = [
        ...toSync,
        {
          requestId: randomUUID(),
          type: SyncDataType.SensorConfig,
          data: dataToUpload,
        },
      ];
    });
  } else {
    try {
      await createSensorConfig({ ...dataToUpload });
      console.log("config uploaded to cloud successfully");
    } catch (error) {
      db.update((data) => {
        data[email][env].toSync = [
          {
            requestId: randomUUID(),
            data: dataToUpload,
            type: SyncDataType.SensorConfig,
          },
        ];
      });
      console.log("cloud upload failed");
      await errorHandler({ error });
    }
  }
};
