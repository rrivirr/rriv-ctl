import { ReadlineParser, SerialPort } from "serialport";
import { connectSerial } from "./connect-serial.ts";
import serialCommands from "./serial-commands.ts";
import { getSerialPathFromCache } from "./get-serial-path-from-cache.ts";
import { DefaultObject } from "../types.ts";

export const sendCommands = async (commands: string[], echoResponse = true) => {
  const serialPortPath = getSerialPathFromCache();
  const serialPort = connectSerial(serialPortPath);
  const results = [];

  for (const command of [serialCommands.quietModeCommand, ...commands]) {
    const result = await sendSingleCommand(
      command,
      serialPort,
      echoResponse && command !== serialCommands.quietModeCommand
    );
    results.push(result);
  }

  return results;
};

export const sendSingleCommand = (
  command: string,
  serialPort: SerialPort,
  echoResponse: boolean
) => {
  return new Promise<DefaultObject>((resolve, reject) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const parser = new ReadlineParser({
      delimiter: "\n",
      includeDelimiter: false,
    });

    parser.on("data", function (data: string) {
      if (data.includes("action")) {
        // skip this line, it's just the echo back
        return;
      } else {
        if (timeout) {
          clearTimeout(timeout);
        }
        try {
          const response = JSON.parse(data);
          if (echoResponse) {
            console.log(response);
          }
          serialPort.close();

          const errorMessage = response.error || response.status;
          if (errorMessage) {
            console.log("command sent", command);
            return reject(` command failed with ${errorMessage}`);
          }
          resolve(response);

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          console.log("response not json");
          console.log(data);
          timeout = setTimeout(function () {
            serialPort.close();
            reject(
              "Timed out talking to the datalogger. Ensure it is plugged in."
            );
          }, 3000);
        }
      }
    });

    // TODO: note sure if drain, timeout, and flush are all necessary
    // TODO: this has to do with waiting for the serial port to open and flushing existing input to make a nice file output
    serialPort.drain(() => {
      setTimeout(() => {
        serialPort.flush();
        serialPort.pipe(parser);
        serialPort.write(command);
      }, 1000);
    });
  });
};
