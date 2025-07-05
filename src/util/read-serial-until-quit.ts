import { ReadlineParser } from "serialport";
import * as fs from "fs";
import moment from "moment";
import path from "path";
import serialCommands from "./serial-commands.ts";
import paths from "./paths.ts";
import { connectSerial } from "./connect-serial.ts";

export const readSerialUntilQuit = (
  serialPortPath: string,
  file: string,
  debug: boolean
) => {
  const dir = path.join(paths.getRRIVDir(), "watch");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const logPath = path.join(dir, file);
  const dirPath = logPath.substring(0, logPath.lastIndexOf("/"));
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  console.log(`Watching output and logging sensor data to ${logPath}\n`);

  const parser = new ReadlineParser({
    delimiter: "\n",
    includeDelimiter: false,
  });
  const serialPort = connectSerial(serialPortPath);
  serialPort.write(serialCommands.quietModeCommand);
  // TODO: note sure if drain, timeout, and flush are all necessary
  // TODO: this has to do with waiting for the serial port to open and flushing existing input to make a nice file output
  serialPort.drain(() => {
    setTimeout(() => {
      serialPort.flush();
      serialPort.pipe(parser);
      if (debug) {
        serialPort.write(
          '{"object":"datalogger", "action":"set_mode", "mode":"watch-debug"}\n'
        );
      } else {
        serialPort.write(
          '{"object":"datalogger", "action":"set_mode", "mode":"watch"}\n'
        );
      }
    }, 1000);
  });

  parser.on("data", function (data: string) {
    console.log(data);
    if (data[0] == "{") {
      // skip this line
      return;
    }

    fs.writeFileSync(
      logPath,
      moment().format() + "," + data.toString() + "\n",
      { flag: "a" }
    );
  });
};
