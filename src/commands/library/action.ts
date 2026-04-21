import * as fs from "fs";
import { refactorDatetime } from "../history/action.ts";
import {
  applyLibraryDeviceConfig,
  getLibraryDeviceConfig,
  listLibraryDeviceConfig,
  publishDeviceConfig,
  saveDeviceConfig,
  deleteLibraryDeviceConfig,
} from "../../modules/config/library/config-snapshot.library.ts";
import {
  publishDataloggerConfig,
  listLibraryDataloggerConfig,
  getLibraryDataloggerConfig,
  applyLibraryDataloggerConfig,
  saveDataloggerConfig,
  deleteLibraryDataloggerConfig,
} from "../../modules/config/library/datalogger-config.library.ts";
import {
  applyLibrarySensorConfig,
  getLibrarySensorConfig,
  listLibrarySensorConfig,
  saveSensorConfig,
  publishSensorConfig,
  deleteLibrarySensorConfig,
} from "../../modules/config/library/sensor-config.library.ts";
import { oraPromise } from "../../util/ora-promise.ts";

export const getNameAndVersion = (arg: string) => {
  const [name, version] = arg.split(":");
  return { name, version: +version };
};

const getAuthorNameAndVersion = (arg: string) => {
  const args = arg.split("::");
  let author, nameVersion;
  if (args.length > 1) {
    author = args[0];
    nameVersion = args[1];
  } else {
    nameVersion = args[0];
  }
  const { name, version } = getNameAndVersion(nameVersion);
  return { author, name, version };
};

export const publishAction = async (object: string, name: string) => {
  if (object === "device") {
    await oraPromise(() => publishDeviceConfig({ name }));
  } else if (object === "datalogger") {
    await oraPromise(() => publishDataloggerConfig({ name }));
  } else if (object === "sensor") {
    await oraPromise(() => publishSensorConfig({ name }));
  }
};

export const saveAction = async (
  object: string,
  name: string,
  datetime: string,
  options: any,
) => {
  const { fileName, sensorId, update, deviceIdentifier, note } = options;
  if (deviceIdentifier && !datetime) {
    throw new Error("datetime is required with deviceIdentifier");
  }
  let fileConfig;
  if (fileName) {
    const fileBuffer = fs.readFileSync(fileName);
    fileConfig = JSON.parse(fileBuffer.toString());
  }
  const payload = {
    name,
    datetime: datetime && refactorDatetime(datetime),
    deviceIdentifier,
    sensorId,
    note,
    fileConfig,
    update,
  };

  if (object === "device") {
    await oraPromise(() => saveDeviceConfig(payload));
  } else if (object === "datalogger") {
    await oraPromise(() => saveDataloggerConfig(payload));
  } else if (object === "sensor") {
    await oraPromise(() => saveSensorConfig(payload));
  }
};

export const getAction = async (object: string, arg: string) => {
  const { name, version, author } = getAuthorNameAndVersion(arg);

  const payload = { name, version, author };
  if (object === "device") {
    await oraPromise(() => getLibraryDeviceConfig(payload));
  } else if (object === "datalogger") {
    await oraPromise(() => getLibraryDataloggerConfig(payload));
  } else if (object === "sensor") {
    await oraPromise(() => getLibrarySensorConfig(payload));
  }
};

export const listAction = async (
  object: string,
  nameArg: string,
  options: any,
) => {
  const { filter } = options;
  let name;
  let author;

  if (nameArg) {
    const nameAuthor = getAuthorNameAndVersion(nameArg);
    name = nameAuthor.name || undefined;
    author = nameAuthor.author || undefined;
  }

  const payload = { name, author, search: filter };

  if (object === "device") {
    await oraPromise(() => listLibraryDeviceConfig(payload));
  } else if (object === "datalogger") {
    await oraPromise(() => listLibraryDataloggerConfig(payload));
  } else if (object === "sensor") {
    await oraPromise(() => listLibrarySensorConfig(payload));
  }
};

export const applyAction = async (
  object: string,
  arg: string,
  options: any,
) => {
  const { sensorId } = options;
  const { name, version, author } = getAuthorNameAndVersion(arg);

  const payload = { name, version, author, sensorId };
  if (object === "device") {
    await oraPromise(() => applyLibraryDeviceConfig(payload));
  } else if (object === "datalogger") {
    await oraPromise(() => applyLibraryDataloggerConfig(payload));
  } else if (object === "sensor") {
    await oraPromise(() => applyLibrarySensorConfig(payload));
  }
};

export const deleteAction = async (object: string, name: string) => {
  if (object === "device") {
    await oraPromise(() => deleteLibraryDeviceConfig(name));
  } else if (object === "datalogger") {
    await oraPromise(() => deleteLibraryDataloggerConfig(name));
  } else if (object === "sensor") {
    await oraPromise(() => deleteLibrarySensorConfig(name));
  }
};
