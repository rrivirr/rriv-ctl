import Table from "cli-table3";
import {
  getLibraryConfigSnapshots,
  publishNewConfigSnapshotLibrary,
  publishNewConfigSnapshotLibraryVersion,
  getLibraryConfigSnapshotById,
  getConfigSnapshots,
} from "../../../api/config-snapshot.ts";
import db from "../../../db/db.ts";
import { logToConsole } from "../../../util/console-log.ts";
import { logConfigLibrary } from "../../../util/log-config-library.ts";

export const publishConfigSnapshot = async (body: {
  configSnapshotName: string;
  libraryConfigName: string;
  description?: string;
}) => {
  const { configSnapshotName, libraryConfigName, description } = body;
  const { accessToken } = db.data;

  const configSnapshots = await getConfigSnapshots({
    name: configSnapshotName,
    accessToken,
  });
  const configSnapshot = configSnapshots[0];

  if (!configSnapshot) {
    throw new Error(
      `no saved config snapshot with name '${configSnapshotName}' found`
    );
  }

  const existingConfigSnapshotLibraries = await getLibraryConfigSnapshots({
    accessToken,
    isPublic: false,
    name: libraryConfigName,
  });

  const existingConfigSnapshotLibrary = existingConfigSnapshotLibraries[0];

  if (existingConfigSnapshotLibrary) {
    // publish a new version
    await publishNewConfigSnapshotLibraryVersion({
      libraryConfigSnapshotId: existingConfigSnapshotLibrary.id,
      configSnapshot: {
        configSnapshotId: configSnapshot.id,
      },
      description,
      accessToken,
    });
  } else {
    // doesn't exist create a new record
    await publishNewConfigSnapshotLibrary({
      name: libraryConfigName,
      description,
      configSnapshot: {
        configSnapshotId: configSnapshot.id,
      },
      accessToken,
    });
  }

  logToConsole("successful");
};

export const publishCurrentConfigSnapshot = async (body: {
  libraryConfigName: string;
  description?: string;
}) => {
  const { libraryConfigName, description } = body;
  const {
    accessToken,
    deviceContext: { deviceId, contextId },
  } = db.data;

  const existingConfigSnapshotLibraries = await getLibraryConfigSnapshots({
    accessToken,
    isPublic: false,
    name: libraryConfigName,
  });

  const existingConfigSnapshotLibrary = existingConfigSnapshotLibraries[0];

  if (existingConfigSnapshotLibrary) {
    // publish a new version
    await publishNewConfigSnapshotLibraryVersion({
      libraryConfigSnapshotId: existingConfigSnapshotLibrary.id,
      configSnapshot: {
        deviceId,
        contextId,
      },
      description,
      accessToken,
    });
  } else {
    // doesn't exist create a new record
    await publishNewConfigSnapshotLibrary({
      name: libraryConfigName,
      description,
      configSnapshot: {
        deviceId,
        contextId,
      },
      accessToken,
    });
  }

  logToConsole("successful");
};

export const listLibraryConfigSnapshot = async (body: {
  isPublic?: boolean;
  name?: string;
  search?: string;
}) => {
  const { isPublic, name, search } = body;
  const { accessToken } = db.data;

  const existingConfigSnapshotLibraries = await getLibraryConfigSnapshots({
    name,
    search,
    isPublic,
    accessToken,
  });

  if (name) {
    if (existingConfigSnapshotLibraries.length) {
      const libraryConfigSnapshot = existingConfigSnapshotLibraries[0];

      const libraryConfigSnapshotDetails = await getLibraryConfigSnapshotById({
        libraryConfigSnapshotId: libraryConfigSnapshot.id,
        accessToken,
      });

      const {
        name,
        description,
        Creator: { firstName, lastName },
        SystemLibraryConfigVersion,
      } = libraryConfigSnapshotDetails;

      if (!SystemLibraryConfigVersion.length) {
        logConfigLibrary(existingConfigSnapshotLibraries);
        process.exit();
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
        wrapOnWordBoundary: false,
        colWidths: [30, 30, 12, 80],
      });
      table.push(
        [
          {
            content: `name: ${name}\ndescription: ${description}\ncreator: ${firstName} ${lastName}`,
            rowSpan: 3,
            vAlign: "center",
          },
          {
            content: `version:${version}\ndescription: ${versionDescription}\ncreated by:${versionFirstName} ${versionLastName}`,
            rowSpan: 3,
            vAlign: "center",
          },
          { content: "datalogger", rowSpan: 3, vAlign: "center" },
          {
            content: JSON.stringify(DataloggerConfig[0].config),
            rowSpan: 3,
            vAlign: "center",
          },
        ],
        [],
        []
      );
      for (const { name, config } of SensorConfig) {
        table.push(
          [
            { content: "", rowSpan: 3 },
            { content: "", rowSpan: 3 },
            { content: name, rowSpan: 3, vAlign: "center" },
            { content: JSON.stringify(config), rowSpan: 3, vAlign: "center" },
          ],
          [],
          []
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
              content: `version:${version}\ndescription: ${versionDescription}\ncreated by:${versionFirstName} ${versionLastName}`,
              rowSpan: 3,
              vAlign: "center",
            },
            { content: "datalogger", rowSpan: 3, vAlign: "center" },
            {
              content: JSON.stringify(DataloggerConfig[0].config),
              rowSpan: 3,
              vAlign: "center",
            },
          ],
          [],
          []
        );
        for (const { name, config } of SensorConfig) {
          table.push(
            [
              { content: "", rowSpan: 3 },
              { content: "", rowSpan: 3 },
              { content: name, rowSpan: 3, vAlign: "center" },
              { content: JSON.stringify(config), rowSpan: 3, vAlign: "center" },
            ],
            [],
            []
          );
        }
      }

      console.log(table.toString());
    } else {
      logToConsole(`no library config found with specified name`);
    }
  } else {
    logConfigLibrary(existingConfigSnapshotLibraries);
  }
};
