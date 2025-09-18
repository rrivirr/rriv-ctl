import { JwtPayload as DefaultJwtPayload } from "jwt-decode";
import {
  CreateDataloggerConfigDto,
  CreateSensorConfigDto,
  OverwriteConfigSnapshotDto,
} from "./api/types.ts";
import { SyncDataType } from "./constants.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DefaultObject = Record<string, any>;

export type toSyncConfig = { requestId: string } & (
  | {
      type: SyncDataType.DataloggerConfig;
      data: Omit<CreateDataloggerConfigDto, "accessToken">;
    }
  | {
      type: SyncDataType.SensorConfig;
      data: Omit<CreateSensorConfigDto, "accessToken">;
    }
  | {
      type: SyncDataType.ConfigSnapshot;
      data: Omit<OverwriteConfigSnapshotDto, "accessToken">;
    }
);

export type Source = "command" | "preAction";

export type JwtPayload = DefaultJwtPayload & { name: string; email: string };
