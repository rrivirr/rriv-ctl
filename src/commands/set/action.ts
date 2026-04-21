import * as fs from "fs";
import { DefaultObject } from "../../types.ts";
import { writeConfigToDevice } from "../../infra/write-config-to-device.ts";
import { uploadConfig } from "../../modules/config/config.service.ts";
import { logAsDebug } from "../../util/debug-logger.ts";
import { getActiveUser } from "../../util/get-logged-in-user.ts";
import { oraPromise } from "../../util/ora-promise.ts";

export const setAction = async (
  object: string,
  id: string,
  propertyArg: string,
  propertyValueArg: string,
  options: any,
) => {
  const payload: DefaultObject = { object };

  let sensorId;
  let property = propertyArg;
  let propertyValue = propertyValueArg;

  if (object === "board" || object === "datalogger" || object == "device") {
    // deal with absense of id in board command
    property = id;
    propertyValue = propertyArg;
  } else {
    if (id && object === "sensor") {
      sensorId = id.toLowerCase();
    }
  }

  if (property && propertyValue) {
    payload[property] =
      propertyValue === "true" || propertyValue === "false"
        ? propertyValue === "true"
        : +propertyValue || propertyValue;
  } else {
    const file = options.file;
    if (!file) {
      throw new Error("invalid set command received");
    }
    const fileBuffer = fs.readFileSync(options["file"]);
    const rawFileContents = fileBuffer.toString();
    logAsDebug("rawFileContents", rawFileContents);
    const fileObject = JSON.parse(rawFileContents.toString());
    Object.assign(payload, fileObject);
  }

  if (object === "sensor") {
    if (sensorId) {
      payload["id"] = sensorId;
    }

    if (!payload.id) {
      throw new Error("id is required");
    }

    if (payload.id.length > 6) {
      throw new Error("sensor id cannot be longer than 6 characters");
    }
  }

  const appliedConfig = await oraPromise(() => writeConfigToDevice(payload));
  console.log("config applied to device successfully");

  const user = getActiveUser();

  if (object !== "board" && user.device.id && user.device.id !== "guest") {
    await uploadConfig({
      ...appliedConfig,
      object,
    });
  }
};
