import { Argument, Command } from "commander";
import * as fs from "fs";
import { ReadlineParser } from "serialport";
import serialCommands from "../util/serial-commands.ts";
import { connectSerial } from "../util/connect-serial.ts";
import { getSerialPathFromCache } from "../util/get-serial-path-from-cache.ts";

export const makeSetCommand = (cli: Command) => {
  cli
    .command("set")
    .addArgument(
      new Argument("<object>").choices([
        "sensor",
        "actuator",
        "telemeter",
        "board",
      ])
    )
    .argument("[id]")
    .argument("[property]")
    .argument("[property_value]")
    // .argument('[properities]', 'JSON representation of properties')
    // .option('-p, --path <serial_path>', 'serial path of the RRIV device')
    // .option('-t, --type [type]')
    // .option('--burst-size [burst_size]')
    // .option('--warm-up-delay [warm_up_delay]')
    // .option('-o, --property [sensor_properties...]')
    .option("-f, --file <file>")
    .description("set values on an object or create an object")
    .action((object, id, property, property_value, options) => {
      console.log(object);
      console.log(id);

      let payload = new Map();
      payload.set("object", object);
      payload.set("action", "set");

      if (object === "board") {
        // deal with absense of id in board command
        // TODO: help needs to refect this somehow
        property_value = property;
        property = id;
      } else {
        if (id) {
          console.log(id);
          payload.set("id", id);
        }
      }

      if (property && property_value) {
        let number = Number(property_value);
        if (Number.isNaN(number)) {
          payload.set(property, property_value);
        } else {
          payload.set(property, number);
        }
      } else {
        const properties = fs.readFileSync(options["file"]);
        console.log(properties.toString());
        const propertiesObject = JSON.parse(properties.toString());
        console.log(propertiesObject);
        Object.keys(propertiesObject).forEach((key) => {
          payload.set(key, propertiesObject[key as keyof typeof properties]);
        });
      }

      let payloadString = JSON.stringify(Object.fromEntries(payload)) + "\n";
      console.log(payloadString);

      const serialPortPath = getSerialPathFromCache();
      const serialPort = connectSerial(serialPortPath);
      serialPort.write(serialCommands.quietModeCommand);

      const parser = new ReadlineParser({
        delimiter: "\n",
        includeDelimiter: false,
      });
      parser.on("data", function (data: String) {
        if (data[0] == "{") {
          console.log("echo: " + data);
          // skip this line
          return;
        } else {
          console.log(data);
          process.exit();
        }
      });
      serialPort.pipe(parser);
      serialPort.write(payloadString);
    });
};
