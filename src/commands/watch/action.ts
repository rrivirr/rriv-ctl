import moment from "moment";
import { getSerialPathFromCache } from "../../util/get-serial-path-from-cache.ts";
import { readSerialUntilQuit } from "../../util/read-serial-until-quit.ts";

export const watchAction = (options: any) => {
  let project = options.project ?? "rriv";
  let file =
    options.file ??
    project + "_" + moment().format("YYYY-MM-DDTHH:mm") + "_watch.txt";
  let debug = options.debug;

  let serialPortPath = options.path ?? getSerialPathFromCache();

  readSerialUntilQuit(serialPortPath, file, debug);
};
