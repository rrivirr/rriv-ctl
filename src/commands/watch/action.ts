import moment from "moment";
import { connectAsync } from "mqtt";
import path from "path";
import * as fs from "fs";
import paths from "../../util/paths.ts";
import { getSerialPathFromCache } from "../../util/get-serial-path-from-cache.ts";
import { readSerialUntilQuit } from "../../infra/read-serial-until-quit.ts";
import { getDevices } from "../../api/device.ts";
import { getConfig } from "../../util/config.ts";
import { getActiveUser } from "../../util/get-logged-in-user.ts";

export const watchAction = async (deviceIdentifier: string, options: any) => {
  const project = options.project ?? "rriv";
  const {
    context: { id },
  } = getActiveUser();

  if (deviceIdentifier) {
    const device = await getDevices({
      identifier: deviceIdentifier,
      contextId: id || undefined,
    });
    if (!device.length) {
      console.log("no device found with specified identifier");
      return;
    }
    const eui = device[0].DeviceEuis[0]?.eui;
    if (!eui) {
      console.log("no euis registered for device");
      return;
    }
    const config = getConfig();
    const mqttUrl = config.MQTT_URL;
    if (!mqttUrl) {
      throw new Error("mqtt url not configured");
    }
    const client = await connectAsync(mqttUrl);
    await client.subscribeAsync(`/data/raw/${eui}`);
    const file =
      options.file ??
      project + "_" + moment().format("YYYY-MM-DDTHH:mm") + ".txt";

    const logPath = path.join(paths.getRRIVDir(), "remote_watch", file);
    const dirPath = logPath.substring(0, logPath.lastIndexOf("/"));
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    console.log(`listening and logging data to ${logPath}\n`);

    await new Promise<void>((resolve) => {
      client.on("message", (topic, message) => {
        console.log("Received:", JSON.parse(message.toString()));
        fs.writeFileSync(logPath, message.toString() + "\n", { flag: "a" });
      });

      process.on("SIGINT", () => {
        client.end();
        resolve();
      });
    });
  } else {
    const file =
      options.file ??
      project + "_" + moment().format("YYYY-MM-DDTHH:mm") + "_watch.txt";
    const debug = options.debug;

    const serialPortPath = options.path ?? getSerialPathFromCache();

    await readSerialUntilQuit(serialPortPath, file, debug);
  }
};
