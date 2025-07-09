export interface AccessToken {
  accessToken: string;
}
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

export interface ConfigLibrary {
  id: string;
  name: string;
  createdAt: string;
  description: string;
  Creator: { firstName: string; lastName: string };
}

export interface ConfigLibraryById {
  id: string;
  name: string;
  createdAt: string;
  description: string;
  Creator: {
    firstName: string;
    lastName: string;
  };
  SystemLibraryConfigVersion: {
    version: number;
    description: string;
    Creator: {
      firstName: string;
      lastName: string;
    };
    ConfigSnapshot: {
      id: string;
      name: string;
      SensorConfig: {
        name: string;
        id: string;
        config: object;
      }[];
      DataloggerConfig: {
        id: string;
        config: object;
      }[];
    };
  }[];
}

export interface SensorConfigHistory {
  id: string;
  name: string;
  config: object;
  sensorDriverId: string;
  sensorDriver: { name: string };
  active: boolean;
  createdAt: string;
  deactivatedAt: string;
  changesMade: object;
}

export interface ConfigHistory {
  dataloggerConfigs: {
    id: string;
    changesMade: object;
    name: string;
    config: object;
    dataloggerDriverId: string;
    configSnapshotId: string;
    active: boolean;
    createdAt: string;
    deactivatedAt: string;
  }[];
  sensorConfigs: SensorConfigHistory[];
}

export interface ConfigSnapshot {
  id: string;
  name: string;
  createdAt: string;
  active: boolean;
  deviceContextId: string;
  DataloggerConfig: {
    config: object;
    id: string;
  }[];
  SensorConfig: {
    name: string;
    config: object;
    id: string;
  }[];
}

export interface Driver {
  id: string;
  name: string;
  validation: object;
  createdAt: string;
  creator: {
    firstName: string;
    lastName: string;
  };
}

export interface DataloggerConfigLibraryById {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  Creator: {
    firstName: string;
    lastName: string;
  };
  DataloggerLibraryConfigVersion: {
    version: number;
    description: string;
    Creator: {
      firstName: string;
      lastName: string;
    };
    DataloggerConfig: {
      id: string;
      name: string;
      config: object;
      dataloggerDriverId: string;
    };
  }[];
}

export interface SensorConfigLibraryById {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  Creator: {
    firstName: string;
    lastName: string;
  };
  SensorLibraryConfigVersion: {
    version: number;
    description: string;
    Creator: {
      firstName: string;
      lastName: string;
    };
    SensorConfig: {
      id: string;
      name: string;
      config: object;
      sensorDriverId: string;
    };
  }[];
}

export type CreateDataloggerConfigDto = {
  singlePropertyChange: boolean;
  config: object;
  createdAt: string;
  dataloggerDriverId: string;
  name: string;
  deviceId: string;
  contextId: string;
} & AccessToken;

export type CreateSensorConfigDto = {
  singlePropertyChange: boolean;
  config: object;
  createdAt: string;
  sensorDriverId: string;
  name: string;
  deviceId: string;
  contextId: string;
} & AccessToken;

export type OverwriteConfigSnapshotDto = {
  dataloggerConfigId?: string;
  sensorConfigIds: string[];
  createdAt: string;
} & DeviceContextRequest;
