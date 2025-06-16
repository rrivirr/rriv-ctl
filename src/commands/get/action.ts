import { ReadlineParser } from "serialport";
import serialCommands from "../../util/serial-commands.ts";
import { connectSerial } from "../../util/connect-serial.ts";
import { getSerialPathFromCache } from "../../util/get-serial-path-from-cache.ts";

export const getAction = (object: string, id?: string, parameter?: string) => {
  const serialPortPath = getSerialPathFromCache();
  const serialPort = connectSerial(serialPortPath);
  serialPort.write(serialCommands.quietModeCommand);

  const parser = new ReadlineParser({
    delimiter: "\n",
    includeDelimiter: false,
  });
  parser.on("data", function (data: String) {
    console.log(data);
    if (data[0] == "{") {
      // skip this line
      return;
    } else {
      process.exit();
    }
  });
  serialPort.pipe(parser);

  let payload = new Map();
  payload.set("object", object);
  payload.set("action", "get");
  if (object == "board") {
    if (id) {
      payload.set("parameter", id);
    }
  } else {
    if (id) {
      console.log(id);
      payload.set("id", id);
    }
    if (parameter) {
      console.log(parameter);
      payload.set("parameter", parameter);
    }
  }
  let payloadString = JSON.stringify(Object.fromEntries(payload)) + "\n";
  console.log(payloadString);
  serialPort.write(payloadString);
};
