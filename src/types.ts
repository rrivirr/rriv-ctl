import { JwtPayload as DefaultJwtPayload } from "jwt-decode";
import {
  CreateDataloggerConfigDto,
  CreateSensorConfigDto,
  OverwriteConfigSnapshotDto,
} from "./api/types.ts";
import { createFirmwareHistoryEntry } from "./api/device.ts";
import { SyncDataType } from "./constants.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DefaultObject = Record<string, any>;
export type toSyncConfig = { requestId: string } & (
  | {
      type: SyncDataType.DataloggerConfig;
      data: CreateDataloggerConfigDto;
    }
  | {
      type: SyncDataType.SensorConfig;
      data: CreateSensorConfigDto;
    }
  | {
      type: SyncDataType.ConfigSnapshot;
      data: OverwriteConfigSnapshotDto;
    }
  | {
      type: SyncDataType.FirmwareHistory;
      data: Parameters<typeof createFirmwareHistoryEntry>[0];
    }
);

export type Source = "command" | "preAction";

export type Resource = "device" | "datalogger" | "sensor";

export type Environment = "dev" | "staging" | "prod" | "local";

export type JwtPayload = DefaultJwtPayload & { name: string; email: string };
