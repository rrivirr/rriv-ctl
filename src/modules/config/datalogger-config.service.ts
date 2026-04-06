import {
  createDataloggerConfig,
  getDataloggerDrivers,
} from "../../api/datalogger.ts";
import { DefaultObject } from "../../types.ts";
import db from "../../db/db.ts";
import { errorHandler } from "../../util/error-handler.ts";
import { randomUUID } from "crypto";
import { SyncDataType } from "../../constants.ts";
import { getActiveUser } from "../../util/get-logged-in-user.ts";

export const uploadDataloggerConfig = async (payload: DefaultObject) => {
  const {
    email,
    toSync,
    deviceContext: { deviceId, contextId },
    env,
  } = getActiveUser();
  const { dataloggerDriverId: receivedDataloggerDriverId, ...config } = payload;
  let dataloggerDriverId = receivedDataloggerDriverId;

  if (!dataloggerDriverId) {
    const dataloggerDrivers = await getDataloggerDrivers();
    if (!dataloggerDrivers.length) {
      throw new Error("no drivers found; contact admin");
    }

    // @TODO finalize functionality
    // const dataloggerDriversIdName: DefaultObject = {};
    // const { driverName: dataloggerDriverName } = await selectDriverPrompt(
    //   dataloggerDrivers.map((d) => {
    //     dataloggerDriversIdName[d.name] = d.id;
    //     return d.name;
    //   })
    // );
    dataloggerDriverId = dataloggerDrivers[0].id;
  }

  const dataToUpload = {
    name: "datalogger",
    dataloggerDriverId,
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
          data: dataToUpload,
          type: SyncDataType.DataloggerConfig,
        },
      ];
    });
  } else {
    try {
      await createDataloggerConfig({ ...dataToUpload });
      console.log("config uploaded to cloud successfully");
    } catch (error) {
      db.update((data) => {
        data[email][env].toSync = [
          {
            requestId: randomUUID(),
            data: dataToUpload,
            type: SyncDataType.DataloggerConfig,
          },
        ];
      });
      console.log("cloud upload failed");
      await errorHandler({ error });
    }
  }
};
