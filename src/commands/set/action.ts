import * as fs from "fs";
import { DefaultObject } from "../../types.ts";
import { writeConfigToDevice } from "../../util/write-config-to-device.ts";
import { uploadConfig } from "../../modules/config/config.service.ts";

export const setAction = async (
  object: string,
  id: string,
  propertyArg: string,
  propertyValueArg: string,
  options: any
) => {
  const payload: DefaultObject = { object, action: "set" };

  let property = propertyArg;
  let propertyValue = propertyValueArg;

  if (object === "board" || object === "datalogger") {
    // deal with absense of id in board command
    property = id;
    propertyValue = propertyArg;
  } else {
    if (id) {
      payload["id"] = id.toUpperCase();
    }
  }

  if (property && propertyValue) {
    payload[property] = +propertyValue || propertyValue;
  } else {
    const file = options.file;
    if (!file) {
      throw new Error("invalid set command received");
    }
    const fileBuffer = fs.readFileSync(options["file"]);
    const rawFileContents = fileBuffer.toString();
    console.log("rawFileContents", rawFileContents);
    const fileObject = JSON.parse(rawFileContents.toString());
    Object.assign(payload, fileObject);
  }

  if (object !== "board" && object !== "datalogger" && !payload.id) {
    throw new Error("id is required");
  }

  const appliedConfig = await writeConfigToDevice(payload);
  console.log("config applied to device successfully");

  if (object !== "board") {
    await uploadConfig({ ...appliedConfig, singlePropertyChange: false });
  }
};
