import moment from "moment";
import { getSerialPathFromCache } from "../../util/get-serial-path-from-cache.ts";
import { readSerialUntilQuit } from "../../util/read-serial-until-quit.ts";

export const watchAction = (options: any) => {
  const project = options.project ?? "rriv";
  const file =
    options.file ??
    project + "_" + moment().format("YYYY-MM-DDTHH:mm") + "_watch.txt";
  const debug = options.debug;

  const serialPortPath = options.path ?? getSerialPathFromCache();

  readSerialUntilQuit(serialPortPath, file, debug);
};
