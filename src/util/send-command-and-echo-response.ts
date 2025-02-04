import { connectSerial } from "./connect-serial";
import { ReadlineParser } from "serialport";
import serialCommands from "./serial_commands";
import { getSerialPathFromCache } from "./get-serial-path-from-cache";

export const sendCommandAndEchoResponse = (command: string) => {
  const serialPath = getSerialPathFromCache().toString();
  const serialPort = connectSerial(serialPath);

  const parser = new ReadlineParser({
    delimiter: "\n",
    includeDelimiter: false,
  });
  parser.on("data", function (data: string) {
    // console.log("got data");
    if (data.includes("action")) {
      // skip this line, it's just the echo back
      return;
    } else {
      console.log(data);
      try {
        const response = JSON.stringify(JSON.parse(data), null, 2);
        console.log(response);
      } catch (e) {
        console.warn("response not json");
      }
      process.exit();
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
