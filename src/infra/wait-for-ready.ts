import { ReadlineParser } from "serialport";
import { connectSerial } from "./connect-serial.ts";
import { getSerialPathFromCache } from "../util/get-serial-path-from-cache.ts";

export const waitForReady = () => {
  const serialPortPath = getSerialPathFromCache();
  const serialPort = connectSerial(serialPortPath);

  return new Promise<void>((resolve, reject) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const parser = new ReadlineParser({
      delimiter: "\n",
      includeDelimiter: false,
    });

    parser.on("data", function (data: string) {
      if (timeout) {
        clearTimeout(timeout);
      }
      if (data.includes("datalogger-ready")) {
        console.log("device is ready");
        serialPort.close();
        resolve();
      } else {
        timeout = setTimeout(function () {
          serialPort.close();
          reject(
            "Timed out talking to the datalogger. Ensure it is plugged in."
          );
        }, 3000);
      }
    });

    serialPort.flush(() => {
      setTimeout(() => {
        serialPort.pipe(parser);
      }, 1500);
    });
  });
};
