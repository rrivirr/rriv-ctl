import moment from "moment";
import { connect } from "mqtt";
import { getSerialPathFromCache } from "../../util/get-serial-path-from-cache.ts";
import { readSerialUntilQuit } from "../../infra/read-serial-until-quit.ts";
import { getDevices } from "../../api/device.ts";
import { getConfig } from "../../util/config.ts";

export const watchAction = async (deviceIdentifier: string, options: any) => {
  if (deviceIdentifier) {
    const device = await getDevices({ identifier: deviceIdentifier });
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
    const client = connect(mqttUrl);
    await client.subscribeAsync(`/data/raw/${"devEui"}`);
    console.log("listening....");
    client.on("message", (topic, message) => {
      console.log("Received:", JSON.parse(message.toString()));
    });
  } else {
    const project = options.project ?? "rriv";
    const file =
      options.file ??
      project + "_" + moment().format("YYYY-MM-DDTHH:mm") + "_watch.txt";
    const debug = options.debug;

    const serialPortPath = options.path ?? getSerialPathFromCache();

    await readSerialUntilQuit(serialPortPath, file, debug);
  }
};
