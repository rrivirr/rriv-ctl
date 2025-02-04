import { Command } from "commander";
import { SerialPort, ReadlineParser } from "serialport";
import { cacheSerialPath } from "../util/cache-serial-path";
import { connectSerial } from "../util/connect-serial";
import { getSerialPathFromCache } from "../util/get-serial-path-from-cache";
import serialCommands from "../util/serial_commands";

export const makeConnectCommand = (cli: Command) => {
  cli
    .command("connect")
    .option("-p, --path <serial_path>", "serial path of the RRIV device")
    .action((options) => {
      if (!options.path) {
        SerialPort.list().then((list) => {
          // detect the serial port
          let serialPortPath = "";
          for (const pathItem of list) {
            if (pathItem.productId && pathItem.pnpId?.includes("rriv")) {
              console.log(`Found a RRIV device ${pathItem.pnpId}`);
              console.log(`Connecting to it at ${pathItem.path}`);
              serialPortPath = pathItem.path;
            }
          }
          if (serialPortPath === "") {
            console.log("No RRIV device found");
            console.log(
              "Try using -p <path> to specify the path to the RRIV serial device"
            );
            return;
          }

          cacheSerialPath(serialPortPath);

          // set epoch
          const now = Date.now();
          const epoch = Math.floor(now / 1000);
          let payload = new Map();
          payload.set("object", "board");
          payload.set("action", "set");
          payload.set("epoch", epoch);

          let payloadString =
            JSON.stringify(Object.fromEntries(payload)) + "\n";

          const serialPath = getSerialPathFromCache();
          const serialPort = connectSerial(serialPath.toString());
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
        });
      } else {
        cacheSerialPath(options.path);
      }
    });
};
