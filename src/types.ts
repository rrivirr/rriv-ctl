export type DefaultObject = {
  [key: string]: any;
};

export type AccessToken = { accessToken: string };
export type IdRequest = { id: string } & AccessToken;

export type ContextNameRequest = {
  contextName: string;
} & AccessToken;

export type Context = {
  id: string;
  name: string;
  accountId: string;
  startedAt: string;
  endedAt: string;
};

export type DeviceContextRequest = {
  contextId: string;
  deviceId: string;
} & AccessToken;

export type DeviceContext = {
  id: string;
  deviceId: string;
  contextId: string;
  assignedDeviceName: string;
  startedAt: string;
  endedAt: string;
};

export type Device = {
  id: string;
  serialNumber: string;
  uniqueName: string;
  createdAt: string;
};

export type ConfigLibrary = Array<{
  id: string;
  name: string;
  createdAt: string;
  description: string;
  Creator: { firstName: string; lastName: string };
}>;
