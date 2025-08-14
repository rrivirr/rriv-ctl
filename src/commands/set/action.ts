import * as fs from "fs";
import { DefaultObject } from "../../types.ts";
import { logToConsole } from "../../util/console-log.ts";
import { writeConfigToDevice } from "../../util/write-config-to-device.ts";
import { uploadConfig } from "../../modules/config/config.service.ts";

export const setAction = async (
  object: string,
  id: string,
  property: string,
  property_value: string,
  options: any
) => {
  const payload: DefaultObject = { object, action: "set" };
  let singlePropertyChange = false;

  if (object === "board" || object === "datalogger") {
    // deal with absense of id in board command
    payload[id] = +property || property;
  } else {
    if (id && property && property_value) {
      payload["id"] = id;
      payload[property] = +property_value || property_value;
      singlePropertyChange = true;
    } else {
      const file = options.file;
      if (!file) {
        throw new Error("invalid set command received");
      }
      const fileBuffer = fs.readFileSync(options["file"]);
      const rawFileContents = fileBuffer.toString();
      logToConsole("rawFileContents", rawFileContents);
      const fileObject = JSON.parse(rawFileContents.toString());
      Object.assign(payload, fileObject);
    }
  }

  const {
    sensorDriverId: _,
    dataloggerDriverId: __,
    ...devicePayload
  } = payload;
  writeConfigToDevice(devicePayload);
  logToConsole("config applied to device successfully");

  if (object !== "board") {
    await uploadConfig({ ...payload, singlePropertyChange });
  }
};
