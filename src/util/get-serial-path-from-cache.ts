import * as fs from "fs";
import path from "path";
import paths from "./paths";

export const getSerialPathFromCache = () => {
  const defaultSerial = path.join(paths.getRrivCtlDir(), "default_serial");
  const serialPath = fs.readFileSync(defaultSerial);
  return serialPath;
};
