import Table from "cli-table3";
import { getActiveConfigSnapshot } from "../../../api/config-snapshot.ts";
import {
  getSensorLibraryConfig,
  getSensorLibraryConfigById,
  publishNewSensorLibraryConfig,
  publishNewSensorLibraryConfigVersion,
} from "../../../api/sensor.ts";
import db from "../../../db/db.ts";
import { logConfigLibrary } from "../../../util/log-config-library.ts";
import { writeConfigToDevice } from "../../../util/write-config-to-device.ts";
import { sendCommandAndEchoResponse } from "../../../util/send-command-and-echo-response.ts";
import { uploadSensorConfig } from "../sensor-config.service.ts";

export const publishCurrentSensorConfig = async (body: {
  libraryConfigName: string;
  sensor: string;
  description?: string;
}) => {
  const { libraryConfigName, sensor, description } = body;
  const {
    deviceContext: { deviceId, contextId },
    accessToken,
  } = db.data;

  const configSnapshot = await getActiveConfigSnapshot({
    contextId,
    deviceId,
    accessToken,
  });

  const { sensorConfig } = configSnapshot;
  const selectedSensorConfig = sensorConfig.find((s) => s.name === sensor);
  if (!selectedSensorConfig) {
    throw new Error(`${sensor} not found in currently applied config`);
  }

  const existingSensorLibraryConfigs = await getSensorLibraryConfig({
    accessToken,
    isPublic: false,
    name: libraryConfigName,
  });

  const existingSensorLibraryConfig = existingSensorLibraryConfigs[0];

  if (existingSensorLibraryConfig) {
    await publishNewSensorLibraryConfigVersion({
      sensorConfigId: selectedSensorConfig.id,
      sensorLibraryId: existingSensorLibraryConfig.id,
      accessToken,
      description,
    });
  } else {
    await publishNewSensorLibraryConfig({
      name: libraryConfigName,
      description,
      accessToken,
      sensorConfigId: selectedSensorConfig.id,
    });
  }

  console.log("successful");
};

export const listLibrarySensorConfig = async (body: {
  isPublic?: boolean;
  name?: string;
  search?: string;
}) => {
  const { isPublic, name, search } = body;
  const { accessToken } = db.data;

  const sensorLibraryConfigs = await getSensorLibraryConfig({
    name,
    search,
    isPublic,
    accessToken,
  });

  if (name) {
    if (sensorLibraryConfigs.length) {
      const sensorLibraryConfig = sensorLibraryConfigs[0];
      const sensorLibraryConfigDetails = await getSensorLibraryConfigById({
        sensorLibraryId: sensorLibraryConfig.id,
        accessToken,
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
            content: `name:${configName}\nversion:${version}\ndescription: ${versionDescription}\ncreated by:${versionFirstName} ${versionLastName}`,
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
            },
          ],
          [],
          []
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

export const applyPublishedSensorConfig = async (body: {
  name: string;
  version?: number;
}) => {
  const { name, version } = body;
  const { accessToken } = db.data;

  const sensorLibraryConfigs = await getSensorLibraryConfig({
    name,
    accessToken,
  });

  if (!sensorLibraryConfigs.length) {
    throw new Error("no sensor library config found with specified name");
  }

  const sensorLibraryConfig = sensorLibraryConfigs[0];
  const sensorLibraryConfigDetails = await getSensorLibraryConfigById({
    sensorLibraryId: sensorLibraryConfig.id,
    accessToken,
  });

  const { SensorLibraryConfigVersion } = sensorLibraryConfigDetails;

  if (!SensorLibraryConfigVersion.length) {
    throw new Error("library config specified is empty");
  }

  let sensorConfigToApply;
  if (!version) {
    // latest version
    sensorConfigToApply = SensorLibraryConfigVersion[0];
  } else {
    sensorConfigToApply = SensorLibraryConfigVersion.find(
      (s) => s.version === version
    );

    if (!sensorConfigToApply) {
      throw new Error("invalid library config version received");
    }
  }
  const {
    SensorConfig: { config, sensorDriverId },
  } = sensorConfigToApply;

  await sendCommandAndEchoResponse(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    JSON.stringify({ action: "remove", object: (config as any).object })
  );
  await writeConfigToDevice(config);

  await uploadSensorConfig({
    ...config,
    singlePropertyChange: false,
    sensorDriverId,
  });
};
