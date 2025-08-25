import { ReadlineParser } from "serialport";
import { connectSerial } from "./connect-serial.ts";
import serialCommands from "./serial-commands.ts";
import { getSerialPathFromCache } from "./get-serial-path-from-cache.ts";
import { DefaultObject } from "../types.ts";

export const sendCommands = async (commands: string[], echoResponse = true) => {
  const results = [];

  for (const command of [serialCommands.quietModeCommand, ...commands]) {
    const result = await sendSingleCommand(
      command,
      echoResponse && command !== serialCommands.quietModeCommand
    );
    results.push(result);
  }

  return results;
};

export const sendSingleCommand = (command: string, echoResponse: boolean) => {
  const serialPortPath = getSerialPathFromCache();
  const serialPort = connectSerial(serialPortPath);

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

    serialPort.pipe(parser);
    serialPort.write(command);
    serialPort.drain(() => {
      serialPort.flush();
    });
  });
};
