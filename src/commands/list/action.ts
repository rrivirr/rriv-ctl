import { listContexts } from "../../modules/context/context.service.ts";
import { listConfigHistory } from "../../modules/config/config-history.service.ts";
import { listConfigSnapshot } from "..//../modules/config/config-snapshot.service.ts";
import { listLibraryConfigSnapshot } from "../../modules/config/library/config-snapshot.library.ts";
import { listLibrarySensorConfig } from "../../modules/config/library/sensor-config.library.ts";
import { listLibraryDataloggerConfig } from "../../modules/config/library/datalogger-config.library.ts";
import { listDevices } from "../../modules/device/device.service.ts";
import { listContextDevices } from "../../modules/context/device-context.service.ts";
import { sendCommands } from "../../util/send-commands.ts";

export const listAction = async (object: string, options: any) => {
  let isPublic = undefined;

  const isPrivate = options.private;
  if (isPrivate) {
    isPublic = isPrivate === "true" ? false : true;
  }

  if (["sensor", "actuator", "telemeter"].includes(object)) {
    const payload = new Map();
    payload.set("object", object);
    payload.set("action", "list");
    const payloadString = JSON.stringify(Object.fromEntries(payload)) + "\n";

    await sendCommands([payloadString]);
  } else if (object === "context") {
    await listContexts(options);
  } else if (object === "device") {
    await listDevices();
  } else if (object === "context-devices") {
    await listContextDevices();
  } else if (object === "config-history") {
    const asAt = options?.asAt;
    const optionsKeys = Object.keys(options);
    if (
      optionsKeys.length > 1 ||
      (optionsKeys.length && optionsKeys[0] !== "asAt")
    ) {
      throw new Error("option not supported by config history");
    }
    await listConfigHistory(asAt);
  } else if (object === "config-snapshot") {
    await listConfigSnapshot(options);
  } else if (object === "library-config-snapshot") {
    await listLibraryConfigSnapshot({ ...options, isPublic });
  } else if (object === "library-sensor-config") {
    await listLibrarySensorConfig({ ...options, isPublic });
  } else if (object === "library-datalogger-config") {
    await listLibraryDataloggerConfig({ ...options, isPublic });
  }
};
