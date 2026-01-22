import Table from "cli-table3";
import crypto from "crypto";
import {
  getSensorLibraryConfig,
  getSensorLibraryConfigById,
  publishNewSensorLibraryConfig,
  publishNewSensorLibraryConfigVersion,
  updateSensorLibraryConfig,
  deleteSensorLibraryConfig,
} from "../../../api/sensor.ts";
import { logConfigLibrary } from "../../../util/log-config-library.ts";
import { writeConfigToDevice } from "../../../infra/write-config-to-device.ts";
import { uploadSensorConfig } from "../sensor-config.service.ts";
import { sendCommands } from "../../../infra/send-commands.ts";
import { getActiveUser } from "../../../util/get-logged-in-user.ts";
import {
  GetLibraryConfigDto,
  SaveConfigToLibraryDto,
  ApplyLibraryConfigDto,
  ListLibraryConfigDto,
  PublishLibraryConfigDto,
} from "./types.ts";
import { getConfigHistoryAtTime } from "../config-history.service.ts";

export const saveSensorConfig = async (body: SaveConfigToLibraryDto) => {
  const {
    name,
    fileConfig,
    update,
    deviceId: specifiedDeviceId,
    note,
    datetime,
    sensorId,
  } = body;
  const {
    deviceContext: { deviceId: connectedDeviceId },
  } = getActiveUser();
  let config;
  const deviceId = specifiedDeviceId || connectedDeviceId;

  if (fileConfig) {
    config = { ...fileConfig, object: "sensor" };
  } else {
    if (!sensorId) {
      throw new Error("no sensor id specified");
    }
    if (!deviceId) {
      throw new Error("no connected device/deviceId specified");
    }

    if (datetime) {
      const history = await getConfigHistoryAtTime({
        deviceId,
        datetime,
        resource: "sensor",
        sensorId,
        returnResult: true,
      });
      if (
        !history ||
        !Object.keys(history?.snapshotToLog).length ||
        !history?.snapshotToLog?.sensors?.length
      ) {
        throw new Error("no snapshot found at specified timestamp");
      }

      const sensor = history.snapshotToLog.sensors[0];
      const { id, ...sensorConfig } = sensor;

      config = { name: id, ...sensorConfig };
    } else {
      const [sensorConfig] = await sendCommands(
        [JSON.stringify({ object: "sensor", action: "get", id: sensorId })],
        false,
      );

      config = { ...sensorConfig, object: "sensor" };
    }
  }

  if (!config) {
    throw new Error("no config found");
  }

  const existingSensorLibraryConfigs = await getSensorLibraryConfig({
    name,
  });
  const existingSensorLibraryConfig = existingSensorLibraryConfigs[0];

  if (update) {
    if (!existingSensorLibraryConfig) {
      throw new Error("no existing library found with name");
    }
    await publishNewSensorLibraryConfigVersion({
      config,
      sensorLibraryId: existingSensorLibraryConfig.id,
      description: note,
      sensorName: config.name || crypto.randomBytes(5).toString("hex"),
    });
  } else {
    await publishNewSensorLibraryConfig({
      name,
      description: note,
      config,
    });
  }

  console.log("successful");
};

export const listLibrarySensorConfig = async (body: ListLibraryConfigDto) => {
  const { author, name, search } = body;

  const sensorLibraryConfigs = await getSensorLibraryConfig({
    name,
    search,
    author,
  });

  if (name) {
    if (sensorLibraryConfigs.length) {
      const sensorLibraryConfig = sensorLibraryConfigs[0];
      const sensorLibraryConfigDetails = await getSensorLibraryConfigById({
        sensorLibraryId: sensorLibraryConfig.id,
      });

      const {
        name,
        description,
        Creator: { firstName, lastName },
        SensorLibraryConfigVersion,
      } = sensorLibraryConfigDetails;

      if (!SensorLibraryConfigVersion.length) {
        logConfigLibrary(sensorLibraryConfigs);
        return;
      }

      const [firstVersion, ...remainingVersions] = SensorLibraryConfigVersion;
      const {
        version,
        description: versionDescription,
        SensorConfig: { config, name: configName },
        Creator: { firstName: versionFirstName, lastName: versionLastName },
      } = firstVersion;

      const table = new Table({
        head: ["librarySensorConfig", "version", "config"],
        wordWrap: true,
        wrapOnWordBoundary: true,
        colWidths: [30, 30, 80],
      });
      table.push(
        [
          {
            content: `name: ${name}\ndescription: ${description}\ncreator: ${firstName} ${lastName}`,
            rowSpan: 3,
            vAlign: "center",
          },
          {
            content: `name:${configName}\nversion:${version}\ndescription: ${versionDescription}\ncreated by:${versionFirstName} ${versionLastName}`,
            rowSpan: 3,
            vAlign: "center",
          },
          {
            content: JSON.stringify(config),
            rowSpan: 3,
            vAlign: "center",
            wrapOnWordBoundary: false,
          },
        ],
        [],
        [],
      );

      for (const {
        version,
        description: versionDescription,
        SensorConfig: { config, name: configName },
        Creator: { firstName: versionFirstName, lastName: versionLastName },
      } of remainingVersions) {
        table.push(
          [
            { content: "", rowSpan: 3 },
            {
              content: `name:${configName}\nversion:${version}\ndescription: ${versionDescription}\ncreated by:${versionFirstName} ${versionLastName}`,
              rowSpan: 3,
              vAlign: "center",
            },
            {
              content: JSON.stringify(config),
              rowSpan: 3,
              vAlign: "center",
              wrapOnWordBoundary: false,
            },
          ],
          [],
          [],
        );
      }

      console.log("\n" + table.toString());
    } else {
      console.log(`no library config found with specified name`);
    }
  } else {
    logConfigLibrary(sensorLibraryConfigs);
  }
};

export const publishSensorConfig = async (body: PublishLibraryConfigDto) => {
  const { name } = body;
  const sensorLibraryConfigs = await getSensorLibraryConfig({
    name,
  });
  if (!sensorLibraryConfigs.length) {
    throw new Error("no library config found with specified name");
  }

  const sensorLibraryConfig = sensorLibraryConfigs[0];

  await updateSensorLibraryConfig({
    sensorLibraryId: sensorLibraryConfig.id,
    isPublic: true,
  });
};

export const getLibrarySensorConfig = async (body: GetLibraryConfigDto) => {
  const { name, author, version, returnResult } = body;

  const sensorLibraryConfigs = await getSensorLibraryConfig({
    name,
    author,
  });

  if (!sensorLibraryConfigs.length) {
    throw new Error("no sensor library config found with specified name");
  }

  const sensorLibraryConfig = sensorLibraryConfigs[0];
  const sensorLibraryConfigDetails = await getSensorLibraryConfigById({
    sensorLibraryId: sensorLibraryConfig.id,
  });

  const { SensorLibraryConfigVersion } = sensorLibraryConfigDetails;

  if (!SensorLibraryConfigVersion.length) {
    throw new Error("library config specified is empty");
  }

  let sensorConfig;
  if (!version) {
    // latest version
    sensorConfig = SensorLibraryConfigVersion[0];
  } else {
    sensorConfig = SensorLibraryConfigVersion.find(
      (s) => s.version === version,
    );

    if (!sensorConfig) {
      throw new Error("invalid library config version received");
    }
  }
  const {
    SensorConfig: { config, name: sensorName },
  } = sensorConfig;

  if (returnResult) {
    return { ...config, id: sensorName };
  }
  console.log(JSON.stringify({ ...config, id: sensorName }, null, 2));
};

export const applyLibrarySensorConfig = async (body: ApplyLibraryConfigDto) => {
  const { name, version, author, sensorId } = body;

  const config = await getLibrarySensorConfig({
    name,
    version,
    author,
    returnResult: true,
  });

  if (!config || !Object.keys(config).length) {
    throw new Error("library config is empty");
  }

  const id = sensorId?.toUpperCase() || crypto.randomBytes(5).toString("hex");

  await writeConfigToDevice({ ...config, id });
  await uploadSensorConfig({ ...config, id });
};

export const deleteLibrarySensorConfig = async (name: string) => {
  await deleteSensorLibraryConfig({ name });
};
