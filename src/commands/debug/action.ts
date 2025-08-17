import { ReadlineParser } from "serialport";
import { getSerialPathFromCache } from "../../util/get-serial-path-from-cache.ts";
import { connectSerial } from "../../util/connect-serial.ts";

export const debugAction = () => {
  const serialPortPath = getSerialPathFromCache();

  const parser = new ReadlineParser({
    delimiter: "\n",
    includeDelimiter: false,
  });
  const serialPort = connectSerial(serialPortPath);

  parser.on("data", function (data: string) {
    console.log(data);
  });

  serialPort.pipe(parser);
};
