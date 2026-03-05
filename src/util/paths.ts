import path from "path";
import { homedir as getHomeDir } from "os";
import { existsSync, mkdirSync } from "fs";

export function getRRIVDir() {
  const homedir = getHomeDir();
  return path.join(homedir, ".rriv");
}

export function getRrivCtlDir() {
  return path.join(getRRIVDir(), ".rrivctl");
}

export function getRrivCtlFirmwareDir() {
  const dirPath = path.join(getRrivCtlDir(), "firmware");
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}

export function getRrivCtlScriptsDir() {
  const dirPath = path.join(getRrivCtlDir(), "scripts");
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}

export function defaultSerialFile() {
  return path.join(getRrivCtlDir(), "default_serial");
}

export default {
  getRRIVDir,
  getRrivCtlDir,
  defaultSerialFile,
};
