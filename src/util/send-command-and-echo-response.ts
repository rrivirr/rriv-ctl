import { ReadlineParser } from "serialport";
import { connectSerial } from "./connect-serial.ts";
import serialCommands from "./serial-commands.ts";
import { getSerialPathFromCache } from "./get-serial-path-from-cache.ts";

export const sendCommandAndEchoResponse = (command: string) => {
  const serialPortPath = getSerialPathFromCache();
  const serialPort = connectSerial(serialPortPath);

  const parser = new ReadlineParser({
    delimiter: "\n",
    includeDelimiter: false,
  });
  parser.on("data", function (data: string) {
    console.log("..");
    if (data.includes("action")) {
      // skip this line, it's just the echo back
      return;
    } else {
      // console.log(data);
      try {
        const response = JSON.stringify(JSON.parse(data), null, 2);
        console.log(response);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        console.warn("response not json");
        console.log(data);
      }
      if (data.endsWith("}")) {
        process.exit();
      }
    }
  });

  serialPort.write(serialCommands.quietModeCommand);
  // TODO: note sure if drain, timeout, and flush are all necessary
  // TODO: this has to do with waiting for the serial port to open and flushing existing input to make a nice file output
  serialPort.drain(() => {
    setTimeout(() => {
      serialPort.flush();
      serialPort.pipe(parser);
      serialPort.write(command);
    }, 1000);
  });
};
