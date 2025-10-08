import "lowdb";
import { JSONFileSyncPreset } from "lowdb/node";
import fs from "fs";
import { toSyncConfig } from "../types.ts";
import { getRrivCtlDir } from "../util/paths.ts";
import { UpdateChannel } from "../constants.ts";

export interface Data {
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
  toSync: toSyncConfig[];
  lastVersionCheckAt: Date;
  updateChannel: UpdateChannel;
  replSigIntFunctions: Function[];
}

const defaultData: Data = {
  accessToken: "",
  context: { id: "", name: "" },
  device: { id: "", uniqueName: "", serialNumber: "", serialPortPath: "" },
  deviceContext: {
    contextId: "",
    deviceId: "",
    assignedDeviceName: "",
  },
  expirationTime: 0,
  toSync: [],
  lastVersionCheckAt: new Date("1/1/1970"),
  updateChannel: "stable",
  replSigIntFunctions: [],
};

const dirPath = getRrivCtlDir();
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}
const db = JSONFileSyncPreset<Data>(`${dirPath}/db.json`, defaultData);

export default db;
