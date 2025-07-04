import Table from "cli-table3";
import {
  getDataloggerLibraryConfig,
  getDataloggerLibraryConfigById,
  publishNewDataloggerLibraryConfig,
  publishNewDataloggerLibraryConfigVersion,
} from "../../../api/datalogger.ts";
import db from "../../../db/db.ts";
import { logToConsole } from "../../../util/console-log.ts";
import { logConfigLibrary } from "../../../util/log-config-library.ts";
import { uploadDataloggerConfig } from "../datalogger-config.service.ts";
import { writeConfigToDevice } from "../../../util/write-config-to-device.ts";
import { sendCommandAndEchoResponse } from "../../../util/send-command-and-echo-response.ts";

export const publishCurrentDataloggerConfig = async (body: {
  libraryConfigName: string;
  description?: string;
}) => {
  const { libraryConfigName, description } = body;
  const {
    deviceContext: { deviceId, contextId },
    accessToken,
  } = db.data;

  const existingDataloggerLibraryConfigs = await getDataloggerLibraryConfig({
    accessToken,
    isPublic: false,
    name: libraryConfigName,
  });

  const existingDataloggerLibraryConfig = existingDataloggerLibraryConfigs[0];

  if (existingDataloggerLibraryConfig) {
    await publishNewDataloggerLibraryConfigVersion({
      deviceId,
      description,
      contextId,
      accessToken,
      dataloggerLibraryId: existingDataloggerLibraryConfig.id,
    });
  } else {
    await publishNewDataloggerLibraryConfig({
      name: libraryConfigName,
      deviceId,
      contextId,
      accessToken,
      description,
    });
  }

  logToConsole("successful");
};

export const listLibraryDataloggerConfig = async (body: {
  isPublic?: boolean;
  name?: string;
  search?: string;
}) => {
  const { isPublic, name, search } = body;
  const { accessToken } = db.data;

  const dataloggerLibraryConfigs = await getDataloggerLibraryConfig({
    name,
    search,
    isPublic,
    accessToken,
  });

  if (name) {
    if (dataloggerLibraryConfigs.length) {
      const dataloggerLibraryConfig = dataloggerLibraryConfigs[0];
      const dataloggerLibraryConfigDetails =
        await getDataloggerLibraryConfigById({
          dataloggerLibraryId: dataloggerLibraryConfig.id,
          accessToken,
        });

      const {
        name,
        description,
        Creator: { firstName, lastName },
        DataloggerLibraryConfigVersion,
      } = dataloggerLibraryConfigDetails;

      if (!DataloggerLibraryConfigVersion.length) {
        logConfigLibrary(dataloggerLibraryConfigs);
        process.exit();
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
        wrapOnWordBoundary: false,
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
            content: `version:${version}\ndescription: ${versionDescription}\ncreated by:${versionFirstName} ${versionLastName}`,
            rowSpan: 3,
            vAlign: "center",
          },
          {
            content: JSON.stringify(config),
            rowSpan: 3,
            vAlign: "center",
          },
        ],
        [],
        []
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
              content: `version:${version}\ndescription: ${versionDescription}\ncreated by:${versionFirstName} ${versionLastName}`,
              rowSpan: 3,
              vAlign: "center",
            },
            {
              content: JSON.stringify(config),
              rowSpan: 3,
              vAlign: "center",
            },
          ],
          [],
          []
        );
      }

      console.log(table.toString());
    } else {
      logToConsole(`no library config found with specified name`);
    }
  } else {
    logConfigLibrary(dataloggerLibraryConfigs);
  }
};

export const applyPublishedDataloggerConfig = async (body: {
  name: string;
  version?: number;
}) => {
  const { name, version } = body;
  const { accessToken } = db.data;

  const dataloggerLibraryConfigs = await getDataloggerLibraryConfig({
    name,
    accessToken,
  });

  if (!dataloggerLibraryConfigs.length) {
    throw new Error("no datalogger library config found with specified name");
  }

  const dataloggerLibraryConfig = dataloggerLibraryConfigs[0];
  const dataloggerLibraryConfigDetails = await getDataloggerLibraryConfigById({
    dataloggerLibraryId: dataloggerLibraryConfig.id,
    accessToken,
  });

  const { DataloggerLibraryConfigVersion } = dataloggerLibraryConfigDetails;

  if (!DataloggerLibraryConfigVersion.length) {
    throw new Error("library config specified is empty");
  }

  let dataloggerConfigToApply;
  if (!version) {
    // latest version
    dataloggerConfigToApply = DataloggerLibraryConfigVersion[0];
  } else {
    dataloggerConfigToApply = DataloggerLibraryConfigVersion.find(
      (s: any) => s.version === version
    );

    if (!dataloggerConfigToApply) {
      throw new Error("invalid library config version received");
    }
  }
  const {
    DataloggerConfig: { config, dataloggerDriverId },
  } = dataloggerConfigToApply;

  sendCommandAndEchoResponse(
    JSON.stringify({ action: "remove", object: config.object })
  );
  writeConfigToDevice(config);

  await uploadDataloggerConfig({
    ...config,
    singlePropertyChange: false,
    dataloggerDriverId,
  });
};
