import { ReadlineParser } from "serialport";
import * as fs from "fs";
import moment from "moment";
import path from "path";
import paths from "../util/paths.ts";
import { connectSerial } from "./connect-serial.ts";
import db from "../db/db.ts";
import { logAsDebug } from "../util/debug-logger.ts";

export const readSerialUntilQuit = (
  serialPortPath: string,
  file: string,
  debug: boolean,
) => {
  return new Promise<void>((resolve) => {
    const logPath = path.join(paths.getRRIVDir(), "watch", file);
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
    // TODO: note sure if drain, timeout, and flush are all necessary
    // TODO: this has to do with waiting for the serial port to open and flushing existing input to make a nice file output
    serialPort.drain(() => {
      setTimeout(() => {
        serialPort.flush();
        serialPort.pipe(parser);
        if (debug) {
          serialPort.write(
            '{"object":"datalogger", "action":"set", "mode":"watch-debug"}\n',
          );
        } else {
          serialPort.write(
            '{"object":"datalogger", "action":"set", "mode":"watch"}\n',
          );
        }
      }, 1000);
    });

    parser.on("data", function (data: string) {
      if (data[0] == "{") {
        logAsDebug(data);
        // skip this line
        return;
      } else {
        console.log(data);
      }

      fs.writeFileSync(
        logPath,
        moment().format() + "," + data.toString() + "\n",
        { flag: "a" },
      );
    });

    const replSigIntFunctions = db.data.replSigIntFunctions || [];
    db.update((data) => {
      data.replSigIntFunctions = [
        ...replSigIntFunctions,
        () => {
          serialPort.close();
          resolve();
        },
      ];
    });
  });
};
