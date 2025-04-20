import "lowdb";
import { JSONFileSyncPreset } from "lowdb/node";

type SyncObjectArray = Array<{ requestId: string; data: any }>;

export type Data = {
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
  toSync: {
    dataloggerConfigs: SyncObjectArray;
    sensorConfigs: SyncObjectArray;
  };
};

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
  toSync: {
    dataloggerConfigs: [],
    sensorConfigs: [],
  },
};
const db = JSONFileSyncPreset<Data>("./db.json", defaultData);

export default db;
