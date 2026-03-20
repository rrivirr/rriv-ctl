import Table from "cli-table3";
import {
  getDataloggerLibraryConfig,
  getDataloggerLibraryConfigById,
  publishNewDataloggerLibraryConfig,
  publishNewDataloggerLibraryConfigVersion,
  updateDataloggerLibraryConfig,
  deleteDataloggerLibraryConfig,
} from "../../../api/datalogger.ts";
import { logConfigLibrary } from "../../../util/log-config-library.ts";
import { uploadDataloggerConfig } from "../datalogger-config.service.ts";
import { writeConfigToDevice } from "../../../infra/write-config-to-device.ts";
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

export const saveDataloggerConfig = async (body: SaveConfigToLibraryDto) => {
  const {
    name,
    fileConfig,
    update,
    deviceIdentifier: specifiedDeviceIdentifier,
    note,
    datetime,
  } = body;
  const {
    device: { serialNumber },
  } = getActiveUser();
  let config;
  const deviceIdentifier = specifiedDeviceIdentifier || serialNumber;

  if (fileConfig) {
    config = { ...fileConfig, object: "datalogger" };
  } else {
    if (!deviceIdentifier) {
      throw new Error("no connected device/deviceId specified");
    }

    if (datetime) {
      const history = await getConfigHistoryAtTime({
        deviceIdentifier,
        datetime,
        resource: "datalogger",
        returnResult: true,
      });
      if (
        !history ||
        !Object.keys(history?.snapshotToLog).length ||
        !Object.keys(history?.snapshotToLog?.datalogger)
      ) {
        throw new Error("no snapshot found at specified timestamp");
      }

      config = history.snapshotToLog.datalogger;
    } else {
      const [dataloggerConfig] = await sendCommands(
        [JSON.stringify({ object: "datalogger", action: "get" })],
        false,
      );

      config = { ...dataloggerConfig, object: "datalogger" };
    }
  }

  if (!config) {
    throw new Error("no config found");
  }

  const existingDataloggerLibraryConfigs = await getDataloggerLibraryConfig({
    name,
  });
  const existingDataloggerLibraryConfig = existingDataloggerLibraryConfigs[0];

  if (update) {
    if (!existingDataloggerLibraryConfig) {
      throw new Error("no existing library found with name");
    }
    await publishNewDataloggerLibraryConfigVersion({
      description: note,
      config,
      dataloggerLibraryId: existingDataloggerLibraryConfig.id,
    });
  } else {
    await publishNewDataloggerLibraryConfig({
      name,
      config,
      description: note,
    });
  }

  console.log("successful");
};

export const listLibraryDataloggerConfig = async (
  body: ListLibraryConfigDto,
) => {
  const { name, search, author } = body;

  const dataloggerLibraryConfigs = await getDataloggerLibraryConfig({
    name,
    search,
    author,
  });

  if (name) {
    if (dataloggerLibraryConfigs.length) {
      const dataloggerLibraryConfig = dataloggerLibraryConfigs[0];
      const dataloggerLibraryConfigDetails =
        await getDataloggerLibraryConfigById({
          dataloggerLibraryId: dataloggerLibraryConfig.id,
        });

      const {
        name,
        description,
        Creator: { firstName, lastName },
        DataloggerLibraryConfigVersion,
      } = dataloggerLibraryConfigDetails;

      if (!DataloggerLibraryConfigVersion.length) {
        logConfigLibrary(dataloggerLibraryConfigs);
        return;
      }

      const [firstVersion, ...remainingVersions] =
        DataloggerLibraryConfigVersion;
      const {
        version,
        description: versionDescription,
        DataloggerConfig: { config },
        Creator: { firstName: versionFirstName, lastName: versionLastName },
      } = firstVersion;

      const table = new Table({
        head: ["libraryDataloggerConfig", "version", "config"],
        wordWrap: true,
        wrapOnWordBoundary: true,
        colWidths: [30, 30, 80],
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

      for (const {
        version,
        description: versionDescription,
        DataloggerConfig: { config },
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

      console.log("\n" + table.toString());
    } else {
      console.log(`no library config found with specified name`);
    }
  } else {
    logConfigLibrary(dataloggerLibraryConfigs);
  }
};

export const publishDataloggerConfig = async (
  body: PublishLibraryConfigDto,
) => {
  const { name } = body;
  const dataloggerLibraryConfigs = await getDataloggerLibraryConfig({
    name,
  });
  if (!dataloggerLibraryConfigs.length) {
    throw new Error("no library config found with specified name");
  }

  const dataloggerLibraryConfig = dataloggerLibraryConfigs[0];

  await updateDataloggerLibraryConfig({
    dataloggerLibraryId: dataloggerLibraryConfig.id,
    isPublic: true,
  });
};

export const getLibraryDataloggerConfig = async (body: GetLibraryConfigDto) => {
  const { name, author, version, returnResult } = body;

  const dataloggerLibraryConfigs = await getDataloggerLibraryConfig({
    name,
    author,
  });

  if (!dataloggerLibraryConfigs.length) {
    throw new Error("no datalogger library config found with specified name");
  }

  const dataloggerLibraryConfig = dataloggerLibraryConfigs[0];
  const dataloggerLibraryConfigDetails = await getDataloggerLibraryConfigById({
    dataloggerLibraryId: dataloggerLibraryConfig.id,
  });

  const { DataloggerLibraryConfigVersion } = dataloggerLibraryConfigDetails;

  if (!DataloggerLibraryConfigVersion.length) {
    throw new Error("library config specified is empty");
  }

  let dataloggerConfig;
  if (!version) {
    // latest version
    dataloggerConfig = DataloggerLibraryConfigVersion[0];
  } else {
    dataloggerConfig = DataloggerLibraryConfigVersion.find(
      (s) => s.version === version,
    );

    if (!dataloggerConfig) {
      throw new Error("invalid library config version received");
    }
  }
  const {
    DataloggerConfig: { config },
  } = dataloggerConfig;

  if (returnResult) {
    return config;
  }
  console.log(JSON.stringify(config, null, 2));
};

export const applyLibraryDataloggerConfig = async (
  body: ApplyLibraryConfigDto,
) => {
  const { name, version, author } = body;
  const config = await getLibraryDataloggerConfig({
    name,
    version,
    author,
    returnResult: true,
  });

  if (!config || !Object.keys(config).length) {
    throw new Error("library config is empty");
  }

  await writeConfigToDevice(config);
  await uploadDataloggerConfig(config);
};

export const deleteLibraryDataloggerConfig = async (name: string) => {
  await deleteDataloggerLibraryConfig({ name });
};
