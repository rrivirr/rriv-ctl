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
    await publishDeviceConfig({ name });
  } else if (object === "datalogger") {
    await publishDataloggerConfig({ name });
  } else if (object === "sensor") {
    await publishSensorConfig({ name });
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
    await saveDeviceConfig(payload);
  } else if (object === "datalogger") {
    await saveDataloggerConfig(payload);
  } else if (object === "sensor") {
    await saveSensorConfig(payload);
  }
};

export const getAction = async (object: string, arg: string) => {
  const { name, version, author } = getAuthorNameAndVersion(arg);

  const payload = { name, version, author };
  if (object === "device") {
    await getLibraryDeviceConfig(payload);
  } else if (object === "datalogger") {
    await getLibraryDataloggerConfig(payload);
  } else if (object === "sensor") {
    await getLibrarySensorConfig(payload);
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
    await listLibraryDeviceConfig(payload);
  } else if (object === "datalogger") {
    await listLibraryDataloggerConfig(payload);
  } else if (object === "sensor") {
    await listLibrarySensorConfig(payload);
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
    await applyLibraryDeviceConfig(payload);
  } else if (object === "datalogger") {
    await applyLibraryDataloggerConfig(payload);
  } else if (object === "sensor") {
    await applyLibrarySensorConfig(payload);
  }
};

export const deleteAction = async (object: string, name: string) => {
  if (object === "device") {
    await deleteLibraryDeviceConfig(name);
  } else if (object === "datalogger") {
    await deleteLibraryDataloggerConfig(name);
  } else if (object === "sensor") {
    await deleteLibrarySensorConfig(name);
  }
};
