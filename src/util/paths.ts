import path from "path";
import { homedir as getHomeDir } from "os";

export function getRRIVDir() {
  const homedir = getHomeDir();
  return path.join(homedir, ".rriv");
}

export function getRrivCtlDir() {
  return path.join(getRRIVDir(), ".rrivctl");
}

export function defaultSerialFile() {
  return path.join(getRrivCtlDir(), "default_serial");
}

export default {
  getRRIVDir,
  getRrivCtlDir,
  defaultSerialFile,
};
