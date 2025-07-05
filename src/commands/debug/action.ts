import { ReadlineParser } from "serialport";
import { getSerialPathFromCache } from "../../util/get-serial-path-from-cache.ts";
import { connectSerial } from "../../util/connect-serial.ts";
import { logToConsole } from "../../util/console-log.ts";

export const debugAction = () => {
  logToConsole("debug command");
  const serialPortPath = getSerialPathFromCache();

  const parser = new ReadlineParser({
    delimiter: "\n",
    includeDelimiter: false,
  });
  const serialPort = connectSerial(serialPortPath);

  parser.on("data", function (data: string) {
    logToConsole(data);
  });

  serialPort.pipe(parser);
};
