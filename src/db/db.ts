import "lowdb";
import { JSONFileSyncPreset } from "lowdb/node";
import fs from "fs";
import { toSyncConfig } from "../types.ts";
import { getRrivCtlDir } from "../util/paths.ts";
import { UpdateChannel } from "../constants.ts";

export interface Data {
  name: string;
  accessToken: string;
  context: {
    id: string;
    name: string;
  };
  device: {
    id: string;
    uniqueName: string;
    serialNumber: string;
    serialPortPath: string;
  };
  deviceContext: {
    contextId: string;
    deviceId: string;
    assignedDeviceName: string;
  };
  expirationTime: number;
  lastLoginAt: Date;
  toSync: toSyncConfig[];
}

export type DB = {
  [key: string]: Data;
} & {
  activeEmail: string;
  lastVersionCheckAt: Date;
  updateChannel: UpdateChannel;
  debugMode: boolean;
  replSigIntFunctions: Function[];
};

const dirPath = getRrivCtlDir();
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}
const db = JSONFileSyncPreset<DB>(`${dirPath}/db.json`, {} as DB);

export default db;
