import "lowdb";
import { JSONFileSyncPreset } from "lowdb/node";
import { toSyncConfig } from "../types.ts";

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
};
const db = JSONFileSyncPreset<Data>("./db.json", defaultData);

export default db;
