import { ReadlineParser } from "serialport";
import { connectSerial } from "./connect-serial.ts";
import serialCommands from "./serial-commands.ts";

export const setDeviceEpoch = (serialPortPath: string) => {
  const now = Date.now();
  const epoch = Math.floor(now / 1000);
  let payload = new Map();
  payload.set("object", "board");
  payload.set("action", "set");
  payload.set("epoch", epoch);

  let payloadString = JSON.stringify(Object.fromEntries(payload)) + "\n";

  const serialPort = connectSerial(serialPortPath);
  serialPort.write(serialCommands.quietModeCommand);

  const parser = new ReadlineParser({
    delimiter: "\n",
    includeDelimiter: false,
  });
  parser.on("data", function (data: String) {
    // console.log(data);
    if (data[0] == "{") {
      // skip this line, it's just the echo back
      return;
    } else {
      process.exit();
    }
  });

  serialPort.pipe(parser);
  serialPort.write(payloadString);
};
