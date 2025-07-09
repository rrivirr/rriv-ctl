import {
  createDataloggerConfig,
  getDataloggerDrivers,
} from "../../api/datalogger.ts";
import { selectDriverPrompt } from "../../prompts/config.prompt.ts";
import { DefaultObject } from "../../types.ts";
import db from "../../db/db.ts";
import { logToConsole } from "../../util/console-log.ts";
import { errorHandler } from "../../util/error-handler.ts";
import { randomUUID } from "crypto";
import { SyncDataType } from "../../constants.ts";

export const uploadDataloggerConfig = async (payload: DefaultObject) => {
  const {
    accessToken,
    toSync,
    deviceContext: { deviceId, contextId },
  } = db.data;
  const {
    dataloggerDriverId: receivedDataloggerDriverId,
    singlePropertyChange,
    ...config
  } = payload;
  let dataloggerDriverId = receivedDataloggerDriverId;

  if (!dataloggerDriverId) {
    const dataloggerDrivers = await getDataloggerDrivers({ accessToken });
    if (!dataloggerDrivers.length) {
      throw new Error("no drivers found; contact admin");
    }
    const dataloggerDriversIdName: DefaultObject = {};

    const { driverName: dataloggerDriverName } = await selectDriverPrompt(
      dataloggerDrivers.map((d) => {
        dataloggerDriversIdName[d.name] = d.id;
        return d.name;
      })
    );
    dataloggerDriverId = dataloggerDriversIdName[dataloggerDriverName];
  }

  const dataToUpload = {
    name: "datalogger",
    dataloggerDriverId,
    deviceId,
    contextId,
    singlePropertyChange,
    createdAt: new Date().toISOString(),
    config,
  };

  if (toSync?.length) {
    db.update((data) => {
      data.toSync = [
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
      await createDataloggerConfig({ ...dataToUpload, accessToken });
      logToConsole("config uploaded to cloud successfully");
    } catch (error) {
      db.update((data) => {
        data.toSync = [
          {
            requestId: randomUUID(),
            data: dataToUpload,
            type: SyncDataType.DataloggerConfig,
          },
        ];
      });
      logToConsole("cloud upload failed");
      errorHandler({ error, exit: false });
    }
  }
};
