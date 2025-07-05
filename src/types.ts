export type DefaultObject = Record<string, any>;

export interface AccessToken { accessToken: string }
export type IdRequest = { id: string } & AccessToken;

export type ContextNameRequest = {
  contextName: string;
} & AccessToken;

export interface Context {
  id: string;
  name: string;
  accountId: string;
  startedAt: string;
  endedAt: string;
}

export type DeviceContextRequest = {
  contextId: string;
  deviceId: string;
} & AccessToken;

export interface DeviceContext {
  id: string;
  deviceId: string;
  contextId: string;
  assignedDeviceName: string;
  startedAt: string;
  endedAt: string;
}

export interface Device {
  id: string;
  serialNumber: string;
  uniqueName: string;
  createdAt: string;
}

export type ConfigLibrary = {
  id: string;
  name: string;
  createdAt: string;
  description: string;
  Creator: { firstName: string; lastName: string };
}[];
