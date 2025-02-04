import { Command } from "commander";
import { ReadlineParser } from "serialport";
import { getSerialPathFromCache } from "../util/get-serial-path-from-cache";
import { connectSerial } from "../util/connect-serial";

export const makeDebugCommand = (cli: Command) => {
  cli.command("debug").action(() => {
    const serialPortPath = getSerialPathFromCache();
    const parser = new ReadlineParser({
      delimiter: "\n",
      includeDelimiter: false,
    });
    const serialPort = connectSerial(serialPortPath.toString());

    parser.on("data", function (data: String) {
      console.log(data);
    });

    serialPort.pipe(parser);
  });
};
