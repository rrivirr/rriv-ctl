import "lowdb";
import { JSONFileSyncPreset } from "lowdb/node";
import fs from "fs";
import { Environment, toSyncConfig } from "../types.ts";
import { getRrivCtlDir } from "../util/paths.ts";
import { UpdateChannel } from "../constants.ts";
import { LowSync } from "lowdb";
import { randomUUID } from "crypto";
import path from "path";

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
  currentLoginAt: Date;
  toSync: toSyncConfig[];
}

export type DB = {
  [key: string]: {
    [key: string]: Data;
  };
} & {
  activeEmail: string;
  lastVersionCheckAt: Date;
  updateChannel: UpdateChannel;
  debugMode: boolean;
  autoCompleteSetup: boolean;
  environment: {
    name: Environment;
    config: {
      RRIV_API_URL: string;
      KEYCLOAK_URL: string;
      KEYCLOAK_CLIENT_ID: string;
      DATA_API_URL: string;
      MQTT_URL: string;
      ADMIN_EMAIL: string;
    };
  };
};

const dirPath = getRrivCtlDir();
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

const clearUnendedSessions = () => {
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  const filesToDelete = files
    .filter((f) => f.isFile() && f.name.startsWith("session"))
    .map((f) => path.join(dirPath, f.name));

  if (filesToDelete.length) {
    for (const file of filesToDelete) {
      fs.unlinkSync(file);
    }
  }
};

class Database {
  private readonly defaultDb = JSONFileSyncPreset<DB>(
    `${dirPath}/db.json`,
    {} as DB,
  );
  private db: LowSync<DB>;
  data: DB;

  constructor() {
    this.db = this.defaultDb;
    this.data = this.db.data;
  }

  initializeSessionDb() {
    const sessionId = `session-${randomUUID()}`;
    clearUnendedSessions();
    this.db = JSONFileSyncPreset<DB>(`${dirPath}/${sessionId}.json`, {} as DB);
    const {
      activeEmail,
      environment,
      autoCompleteSetup,
      lastVersionCheckAt,
      updateChannel,
      debugMode,
      ...mainDb
    } = this.defaultDb.data;
    this.db.update((data) => {
      data.activeEmail = activeEmail;
      data[activeEmail] = {};
      data[activeEmail][environment.name] = {
        ...mainDb[activeEmail][environment.name],
      };
      data.autoCompleteSetup = autoCompleteSetup;
      data.lastVersionCheckAt = lastVersionCheckAt;
      data.updateChannel = updateChannel;
      data.debugMode = debugMode;
      data.environment = environment;
    });
    return sessionId;
  }

  update(fn: (data: DB) => unknown) {
    this.db.update(fn);
    this.data = this.db.data;
  }

  resetDb(sessionId?: string) {
    this.db = this.defaultDb;
    this.data = this.db.data;
    if (sessionId) {
      fs.unlinkSync(`${dirPath}/${sessionId}.json`);
    }
  }
}

const db = new Database();

export default db;
