import Table from "cli-table3";
import {
  getLibraryConfigSnapshots,
  publishNewConfigSnapshotLibrary,
  publishNewConfigSnapshotLibraryVersion,
  getLibraryConfigSnapshotById,
  getConfigSnapshots,
} from "../../../api/config-snapshot.ts";
import { logConfigLibrary } from "../../../util/log-config-library.ts";
import { applyConfigSnapshot } from "../config-snapshot.service.ts";
import { getActiveUser } from "../../../util/get-logged-in-user.ts";

export const publishConfigSnapshot = async (body: {
  configSnapshotName: string;
  libraryConfigName: string;
  description?: string;
}) => {
  const { configSnapshotName, libraryConfigName, description } = body;
  const { accessToken } = getActiveUser();

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

  console.log("successful");
};

export const publishCurrentConfigSnapshot = async (body: {
  libraryConfigName: string;
  description?: string;
}) => {
  const { libraryConfigName, description } = body;
  const {
    accessToken,
    deviceContext: { deviceId, contextId },
  } = getActiveUser();

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

  console.log("successful");
};

export const listLibraryConfigSnapshot = async (body: {
  isPublic?: boolean;
  name?: string;
  search?: string;
}) => {
  const { isPublic, name, search } = body;
  const { accessToken } = getActiveUser();

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

      console.log("\n" + table.toString());
    } else {
      console.log(`no library config found with specified name`);
    }
  } else {
    logConfigLibrary(existingConfigSnapshotLibraries);
  }
};

export const applyPublishedConfigSnapshot = async (body: {
  name: string;
  version?: number;
}) => {
  const { name, version } = body;
  const { accessToken } = getActiveUser();

  const existingConfigSnapshotLibraries = await getLibraryConfigSnapshots({
    name,
    accessToken,
  });

  if (!existingConfigSnapshotLibraries.length) {
    throw new Error("no library config found with specified name");
  }

  const libraryConfigSnapshot = existingConfigSnapshotLibraries[0];

  const libraryConfigSnapshotDetails = await getLibraryConfigSnapshotById({
    libraryConfigSnapshotId: libraryConfigSnapshot.id,
    accessToken,
  });

  const { SystemLibraryConfigVersion } = libraryConfigSnapshotDetails;

  if (!SystemLibraryConfigVersion.length) {
    throw new Error("library config specified is empty");
  }

  let configSnapshotToApply;
  if (!version) {
    // latest version
    configSnapshotToApply = SystemLibraryConfigVersion[0];
  } else {
    configSnapshotToApply = SystemLibraryConfigVersion.find(
      (s) => s.version === version
    );

    if (!configSnapshotToApply) {
      throw new Error("invalid library config version received");
    }
  }
  const {
    ConfigSnapshot: { DataloggerConfig, SensorConfig },
  } = configSnapshotToApply;

  await applyConfigSnapshot({
    datalogger: {
      config: DataloggerConfig[0]?.config,
      configId: DataloggerConfig[0]?.id,
    },
    sensor: SensorConfig.map((s) => ({
      config: s.config,
      configId: s.id,
      name: s.name,
    })),
  });
};
