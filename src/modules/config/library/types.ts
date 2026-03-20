export interface SaveConfigToLibraryDto {
  name: string;
  fileConfig?: any;
  sensorId?: string;
  update?: boolean;
  deviceIdentifier?: string;
  note?: string;
  datetime?: string;
}

export interface ListLibraryConfigDto {
  name?: string;
  search?: string;
  author?: string;
}

export interface PublishLibraryConfigDto {
  name: string;
}

export interface GetLibraryConfigDto {
  name?: string;
  author?: string;
  version?: number;
  returnResult?: boolean;
}

export interface ApplyLibraryConfigDto {
  name: string;
  author?: string;
  version?: number;
  sensorId?: string;
}
