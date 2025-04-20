import { Argument, Command } from "commander";
import * as fs from "fs";
import { DefaultObject } from "../types.ts";
import { logToConsole } from "../util/console-log.ts";
import { writeConfigToDevice } from "../util/write-config-to-device.ts";
import { uploadConfig } from "../modules/config/config.service.ts";

export const makeSetCommand = (cli: Command) => {
  cli
    .command("set")
    .addArgument(
      new Argument("<object>").choices([
        "sensor",
        "actuator",
        "datalogger",
        "board",
      ])
    )
    .argument("[id]")
    .argument("[property]")
    .argument("[property_value]")
    .option("-f, --file <file>")
    .description("set values on an object or create an object")
    .action(async (object, id, property, property_value, options) => {
      const payload: DefaultObject = { object, action: "set" };
      let singlePropertyChange: boolean = false;

      if (object === "board") {
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
    });
};
