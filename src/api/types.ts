export interface IdRequest {
  id: string;
}

export interface ContextNameRequest {
  contextName: string;
}

export interface Context {
  id: string;
  name: string;
  accountId: string;
  startedAt: string;
  endedAt: string;
}

export interface DeviceContextRequest {
  contextId: string;
  deviceId: string;
}
export interface ConfigHistoryRequest {
  limit?: number;
  asAt?: string;
  deviceId: string;
  offset?: number;
  order?: string;
  sensorName?: string;
}

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
  DeviceContext: {
    assignedDeviceName: string;
    Context: { name: string; id: string };
  }[];
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
  active: boolean;
  createdAt: string;
  deactivatedAt: string;
  changesMade: object;
  ConfigSnapshot: {
    DeviceContext: {
      Context: {
        name: string;
      };
    };
  };
}

export interface DataloggerConfigHistory {
  id: string;
  changesMade: object;
  name: string;
  config: object;
  dataloggerDriverId: string;
  configSnapshotId: string;
  active: boolean;
  createdAt: string;
  deactivatedAt: string;
  ConfigSnapshot: {
    DeviceContext: {
      Context: {
        name: string;
      };
    };
  };
}

export interface ConfigHistory {
  dataloggerConfigs: DataloggerConfigHistory[];
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

export interface CreateDataloggerConfigDto {
  singlePropertyChange: boolean;
  config: object;
  createdAt: string;
  dataloggerDriverId: string;
  name: string;
  deviceId: string;
  contextId: string;
}

export interface CreateSensorConfigDto {
  singlePropertyChange: boolean;
  config: object;
  createdAt: string;
  sensorDriverId: string;
  name: string;
  deviceId: string;
  contextId: string;
}

export type OverwriteConfigSnapshotDto = {
  dataloggerConfigId?: string;
  sensorConfigIds: string[];
  createdAt: string;
} & DeviceContextRequest;

export interface SignupDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}
