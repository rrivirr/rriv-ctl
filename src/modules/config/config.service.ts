import { DefaultObject } from "../../types.ts";
import { uploadDataloggerConfig } from "./datalogger-config.service.ts";
import { uploadSensorConfig } from "./sensor-config.service.ts";

export const uploadConfig = async (payload: DefaultObject) => {
  if (payload.object === "datalogger") {
    await uploadDataloggerConfig(payload);
  } else {
    await uploadSensorConfig(payload);
  }
};
