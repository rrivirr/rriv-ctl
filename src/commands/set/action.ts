import * as fs from "fs";
import { DefaultObject } from "../../types.ts";
import { writeConfigToDevice } from "../../infra/write-config-to-device.ts";
import { uploadConfig } from "../../modules/config/config.service.ts";
import { logAsDebug } from "../../util/debug-logger.ts";
import { sendCommands } from "../../infra/send-commands.ts";

export const sendAction = async (
  object: string,
  id: string,
  command: string
) => {
  const payload = { object, action: "send", id, command };
  logAsDebug("payload to be sent", payload);
  const result = await sendCommands([JSON.stringify(payload)]);
  console.log(result[0]);
  console.log("successful");
};

export const setAction = async (
  object: string,
  id: string,
  propertyArg: string,
  propertyValueArg: string,
  options: any
) => {
  const payload: DefaultObject = { object };

  let property = propertyArg;
  let propertyValue = propertyValueArg;

  if (object === "board" || object === "datalogger" || object == "device") {
    // deal with absense of id in board command
    property = id;
    propertyValue = propertyArg;
  } else {
    if (id) {
      payload["id"] = id.toUpperCase();
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

  if (object !== "board" && object !== "datalogger" && !payload.id) {
    throw new Error("id is required");
  }

  const appliedConfig = await writeConfigToDevice(payload);
  console.log("config applied to device successfully");

  if (object !== "board") {
    await uploadConfig({
      ...appliedConfig,
      object,
    });
  }
};
