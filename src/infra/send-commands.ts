import { ReadlineParser } from "serialport";
import { connectSerial } from "./connect-serial.ts";
import { getSerialPathFromCache } from "../util/get-serial-path-from-cache.ts";
import { DefaultObject } from "../types.ts";
import { waitForReady } from "./wait-for-ready.ts";
import { logAsDebug } from "../util/debug-logger.ts";
import cli from "../cli.ts";

export const sendCommands = async (
  commands: string[],
  echoResponse = true,
  customPath?: string,
) => {
  const serialPortPath = getSerialPathFromCache();
  const results = [];

  for (const command of commands) {
    logAsDebug("command to be sent", command);
    const result = await sendSingleCommand(
      command + "\n",
      echoResponse,
      customPath || serialPortPath,
    );
    if (result.error) {
      const errorMessage = result.error;
      if (errorMessage?.includes("panic")) {
        console.log("The board crashed and is restarting ");
        console.log("Waiting.......");
        await waitForReady();
        console.log("Reconnected to datalogger");
        throw new Error("exit"); // exit flow without throwing error
      } else if (errorMessage === "datalogger-ready") {
        console.log("datalogger-ready received from device");
        console.log("running command again...\n");
        await cli.parseAsync();
        throw new Error("exit");
      } else {
        throw new Error(`Command failed: ${errorMessage}`);
      }
    }

    results.push(result);
  }

  return results;
};

export const sendSingleCommand = (
  command: string,
  echoResponse: boolean,
  serialPortPath: string,
) => {
  const serialPort = connectSerial(serialPortPath);

  return new Promise<DefaultObject>((resolve, reject) => {
    let timeout: ReturnType<typeof setTimeout> | null = setTimeout(function () {
      serialPort.close();
      logAsDebug("no data received from the device");
      reject("Timed out talking to the datalogger. Ensure it is plugged in.");
    }, 5000);

    const parser = new ReadlineParser({
      delimiter: "\n",
      includeDelimiter: false,
    });

    parser.on("data", function (data: string) {
      logAsDebug("data received", data);
      logAsDebug(".....");
      if (timeout) {
        clearTimeout(timeout);
      }
      if (!data || data?.includes("action")) {
        // skip this line, it's just the echo back
        timeout = setTimeout(function () {
          serialPort.close();
          reject("Timeout following action/empty response");
        }, 5000);
        return;
      } else {
        try {
          const response = JSON.parse(data);
          if (response["mode"] === "field") {
            console.log("Datalogger is in field mode");
          }
          if (echoResponse) {
            console.log(response);
          }
          serialPort.close();
          const errorMessage = response.error || response.status;
          if (errorMessage === "datalogger-ready") {
            return resolve({ error: "datalogger-ready" });
          }
          if (errorMessage) {
            console.log("command sent", command);
            console.log("respone received", response);
            return resolve({ error: errorMessage });
          }
          resolve(response);

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          const split = data.split(",");
          if (+split[0]) {
            logAsDebug(
              "overflow from watch command",
              "command:",
              command,
              "data:",
              data,
            );
            return;
          }
          console.log(command);
          console.log("response not json");
          console.log(data);
          timeout = setTimeout(function () {
            serialPort.close();
            reject("Timeout following invalid response");
          }, 5000);
        }
      }
    });

    serialPort.flush(() => {
      setTimeout(() => {
        serialPort.pipe(parser);
        serialPort.write(command);
      }, 1500);
    });
  });
};
