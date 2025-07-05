import { ReadlineParser } from "serialport";
import { DefaultObject } from "../types.ts";
import { connectSerial } from "./connect-serial.ts";
import { logToConsole } from "./console-log.ts";
import { getSerialPathFromCache } from "./get-serial-path-from-cache.ts";
import serialCommands from "./serial-commands.ts";

export const writeConfigToDevice = (payload: DefaultObject) => {
  const payloadString = JSON.stringify(payload) + "\n";
  logToConsole("payloadString", payloadString);

  const serialPortPath = getSerialPathFromCache();
  const serialPort = connectSerial(serialPortPath);
  serialPort.write(serialCommands.quietModeCommand);

  const parser = new ReadlineParser({
    delimiter: "\n",
    includeDelimiter: false,
  });
  parser.on("data", function (data: string) {
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
};
