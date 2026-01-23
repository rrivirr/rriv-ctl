import Table from "cli-table3";
import crypto from "crypto";
import {
  getLibraryConfigSnapshots,
  createNewConfigSnapshotLibrary,
  createNewConfigSnapshotLibraryVersion,
  getLibraryConfigSnapshotById,
  updateDeviceLibraryConfig,
  deleteDeviceLibraryConfig,
} from "../../../api/config-snapshot.ts";
import { logConfigLibrary } from "../../../util/log-config-library.ts";
import { applyConfigSnapshot } from "../config-snapshot.service.ts";
import { getActiveUser } from "../../../util/get-logged-in-user.ts";
import {
  ListLibraryConfigDto,
  SaveConfigToLibraryDto,
  PublishLibraryConfigDto,
  GetLibraryConfigDto,
  ApplyLibraryConfigDto,
} from "./types.ts";
import { getConfigHistoryAtTime } from "../config-history.service.ts";
import { sendCommands } from "../../../infra/send-commands.ts";
import { DefaultObject } from "../../../types.ts";

export const saveDeviceConfig = async (body: SaveConfigToLibraryDto) => {
  const {
    name,
    fileConfig,
    update,
    deviceId: specifiedDeviceId,
    note,
    datetime,
  } = body;
  const {
    deviceContext: { deviceId: connectedDeviceId },
  } = getActiveUser();
  let config;
  const deviceId = specifiedDeviceId || connectedDeviceId;

  if (fileConfig) {
    const configSensors = [];
    for (const sensor of fileConfig.sensors) {
      const { id, ...sensorConfig } = sensor;

      configSensors.push({
        name: id || crypto.randomBytes(5).toString("hex"),
        object: "sensor",
        ...sensorConfig,
      });
    }
    config = {
      datalogger: { ...fileConfig.datalogger, object: "datalogger" },
      sensors: configSensors,
    };
  } else {
    if (!deviceId) {
      throw new Error("no connected device/deviceId specified");
    }
    if (datetime) {
      const history = await getConfigHistoryAtTime({
        deviceId,
        datetime,
        resource: "device",
        returnResult: true,
      });
      if (!history || !Object.keys(history?.snapshotToLog).length) {
        throw new Error("no snapshot found at specified timestamp");
      }

      const configSensors = [];
      for (const sensor of history.snapshotToLog?.sensors || []) {
        const { id, ...sensorConfig } = sensor;
        configSensors.push({ name: id, ...sensorConfig });
      }
      config = {
        datalogger: history.snapshotToLog.datalogger,
        sensors: configSensors,
      };
    } else {
      let sensorConfigs;
      const [dataloggerConfig, sensors] = await sendCommands(
        [
          JSON.stringify({ object: "datalogger", action: "get" }),
          JSON.stringify({
            object: "sensor",
            action: "list",
            include_configuration: true,
          }),
        ],
        false,
      );
      if (sensors?.sensors?.length) {
        sensorConfigs = await sendCommands(
          sensors.sensors.map((s: any) =>
            JSON.stringify({ object: "sensor", action: "get", id: s.id }),
          ),
        );
      }

      config = {
        datalogger: { ...dataloggerConfig, object: "datalogger" },
        sensors:
          sensorConfigs?.map(({ id, ...sensorConfig }: any) => ({
            name: id,
            object: "sensor",
            ...sensorConfig,
          })) || [],
      };
    }
  }

  if (!config) {
    throw new Error("no config found");
  }
  const existingConfigSnapshotLibraries = await getLibraryConfigSnapshots({
    name,
  });
  const existingConfigSnapshotLibrary = existingConfigSnapshotLibraries[0];

  if (update) {
    if (!existingConfigSnapshotLibrary) {
      throw new Error("no existing library found with name");
    }
    await createNewConfigSnapshotLibraryVersion({
      libraryConfigSnapshotId: existingConfigSnapshotLibrary.id,
      configSnapshot: config,
      description: note,
    });
  } else {
    if (existingConfigSnapshotLibrary) {
      throw new Error("existing library found with name");
    }
    await createNewConfigSnapshotLibrary({
      name,
      description: note,
      configSnapshot: config,
    });
  }

  console.log("successful");
};

export const listLibraryDeviceConfig = async (body: ListLibraryConfigDto) => {
  const { author, name, search } = body;

  const existingConfigSnapshotLibraries = await getLibraryConfigSnapshots({
    name,
    search,
    author,
  });

  if (name) {
    if (existingConfigSnapshotLibraries.length) {
      const libraryConfigSnapshot = existingConfigSnapshotLibraries[0];

      const libraryConfigSnapshotDetails = await getLibraryConfigSnapshotById({
        libraryConfigSnapshotId: libraryConfigSnapshot.id,
      });

      const {
        name,
        description,
        Creator: { firstName, lastName },
        SystemLibraryConfigVersion,
      } = libraryConfigSnapshotDetails;

      if (!SystemLibraryConfigVersion.length) {
        logConfigLibrary(existingConfigSnapshotLibraries);
        return;
      }

      const [firstVersion, ...remainingVersions] = SystemLibraryConfigVersion;
      const {
        version,
        description: versionDescription,
        ConfigSnapshot: { DataloggerConfig, SensorConfig },
        Creator: { firstName: versionFirstName, lastName: versionLastName },
      } = firstVersion;

      const table = new Table({
        head: ["libraryConfigSnapshot", "version", "name", "config"],
        wordWrap: true,
        wrapOnWordBoundary: true,
        colWidths: [30, 30, 12, 80],
      });
      table.push(
        [
          {
            content: `name: ${name}\nnote: ${description}\ncreator: ${firstName} ${lastName}`,
            rowSpan: 3,
            vAlign: "center",
          },
          {
            content: `version:${version}\nnote: ${versionDescription}\ncreated by:${versionFirstName} ${versionLastName}`,
            rowSpan: 3,
            vAlign: "center",
          },
          { content: "datalogger", rowSpan: 3, vAlign: "center" },
          {
            content: JSON.stringify(DataloggerConfig[0].config),
            rowSpan: 3,
            vAlign: "center",
            wordWrap: true,
            wrapOnWordBoundary: false,
          },
        ],
        [],
        [],
      );
      for (const { name, config } of SensorConfig) {
        table.push(
          [
            { content: "", rowSpan: 3 },
            { content: "", rowSpan: 3 },
            { content: name, rowSpan: 3, vAlign: "center" },
            {
              content: JSON.stringify(config),
              rowSpan: 3,
              vAlign: "center",
              wordWrap: true,
              wrapOnWordBoundary: false,
            },
          ],
          [],
          [],
        );
      }

      for (const {
        version,
        description: versionDescription,
        ConfigSnapshot: { DataloggerConfig, SensorConfig },
        Creator: { firstName: versionFirstName, lastName: versionLastName },
      } of remainingVersions) {
        table.push(
          [
            { content: "", rowSpan: 3 },
            {
              content: `version:${version}\nnote: ${versionDescription}\ncreated by:${versionFirstName} ${versionLastName}`,
              rowSpan: 3,
              vAlign: "center",
            },
            { content: "datalogger", rowSpan: 3, vAlign: "center" },
            {
              content: JSON.stringify(DataloggerConfig[0].config),
              rowSpan: 3,
              vAlign: "center",
              wordWrap: true,
              wrapOnWordBoundary: false,
            },
          ],
          [],
          [],
        );
        for (const { name, config } of SensorConfig) {
          table.push(
            [
              { content: "", rowSpan: 3 },
              { content: "", rowSpan: 3 },
              { content: name, rowSpan: 3, vAlign: "center" },
              {
                content: JSON.stringify(config),
                rowSpan: 3,
                vAlign: "center",
                wordWrap: true,
                wrapOnWordBoundary: false,
              },
            ],
            [],
            [],
          );
        }
      }

      console.log("\n" + table.toString());
    } else {
      console.log(`no library config found with specified name`);
    }
  } else {
    logConfigLibrary(existingConfigSnapshotLibraries);
  }
};

export const publishDeviceConfig = async (body: PublishLibraryConfigDto) => {
  const { name } = body;
  const existingConfigSnapshotLibraries = await getLibraryConfigSnapshots({
    name,
  });

  if (!existingConfigSnapshotLibraries.length) {
    throw new Error("no library config found with specified name");
  }

  const libraryConfigSnapshot = existingConfigSnapshotLibraries[0];

  await updateDeviceLibraryConfig({
    libraryConfigSnapshotId: libraryConfigSnapshot.id,
    isPublic: true,
  });
};

export const getLibraryDeviceConfig = async (body: GetLibraryConfigDto) => {
  const { name, author, version, returnResult } = body;

  const existingConfigSnapshotLibraries = await getLibraryConfigSnapshots({
    name,
    author,
  });

  if (!existingConfigSnapshotLibraries.length) {
    throw new Error("no library config found with specified name");
  }

  const libraryConfigSnapshot = existingConfigSnapshotLibraries[0];

  const libraryConfigSnapshotDetails = await getLibraryConfigSnapshotById({
    libraryConfigSnapshotId: libraryConfigSnapshot.id,
  });

  const { SystemLibraryConfigVersion } = libraryConfigSnapshotDetails;

  if (!SystemLibraryConfigVersion.length) {
    throw new Error("library config specified is empty");
  }

  let configSnapshot;
  if (!version) {
    // latest version
    configSnapshot = SystemLibraryConfigVersion[0];
  } else {
    configSnapshot = SystemLibraryConfigVersion.find(
      (s) => s.version === version,
    );

    if (!configSnapshot) {
      throw new Error("invalid library config version received");
    }
  }
  const {
    ConfigSnapshot: { DataloggerConfig, SensorConfig },
  } = configSnapshot;

  const snapshot: DefaultObject = {};
  const snapshotToLog: DefaultObject = {};
  const dataloggerConfig = DataloggerConfig[0];

  if (dataloggerConfig) {
    snapshot["datalogger"] = {
      config: DataloggerConfig[0]?.config,
      configId: DataloggerConfig[0]?.id,
    };
    snapshotToLog["datalogger"] = {
      ...DataloggerConfig[0]?.config,
    };
  }

  if (SensorConfig.length) {
    snapshot["sensors"] = SensorConfig.map((s) => ({
      config: s.config,
      configId: s.id,
      name: s.name,
    }));
    snapshotToLog["sensors"] = SensorConfig.map((s) => ({
      id: s.name,
      ...s.config,
    }));
  }

  if (returnResult) {
    return snapshot;
  }
  console.log(JSON.stringify(snapshotToLog, null, 2));
};

export const applyLibraryDeviceConfig = async (body: ApplyLibraryConfigDto) => {
  const { name, version, author } = body;
  const config = await getLibraryDeviceConfig({
    name,
    version,
    author,
    returnResult: true,
  });

  if (!config || !Object.keys(config).length) {
    throw new Error("library config is empty");
  }

  const snapshot = {} as Parameters<typeof applyConfigSnapshot>[0];
  const dataloggerConfig = config.datalogger;

  snapshot["datalogger"] = dataloggerConfig || {};
  snapshot["sensor"] = config.sensors;

  await applyConfigSnapshot(snapshot);
};

export const deleteLibraryDeviceConfig = async (name: string) => {
  await deleteDeviceLibraryConfig({ name });
};
