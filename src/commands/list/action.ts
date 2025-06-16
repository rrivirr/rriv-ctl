import { listContexts } from "../../modules/context/context.service.ts";
import { listConfigHistory } from "../../modules/config/config-history.service.ts";
import { listConfigSnapshot } from "..//../modules/config/config-snapshot.service.ts";
import { listLibraryConfigSnapshot } from "../../modules/config/library/config-snapshot.library.ts";
import { listLibrarySensorConfig } from "../../modules/config/library/sensor-config.library.ts";
import { listLibraryDataloggerConfig } from "../../modules/config/library/datalogger-config.library.ts";

export const listAction = async (object: string, options: any) => {
  let isPublic = undefined;

  const isPrivate = options.private;
  if (isPrivate) {
    isPublic = isPrivate === "true" ? false : true;
  }

  if (object === "context") {
    await listContexts(options);
  } else if (object === "config-history") {
    if (Object.keys(options).length) {
      throw new Error("option not supported by config history");
    }
    await listConfigHistory();
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
