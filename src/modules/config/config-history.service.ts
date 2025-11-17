import Table from "cli-table3";
import { getConfigHistory } from "../../api/config-snapshot.ts";
import { SensorConfigHistory } from "../../api/types.ts";
import { DefaultObject } from "../../types.ts";
import { getActiveUser } from "../../util/get-logged-in-user.ts";

export const listConfigHistory = async (asAt?: string) => {
  const {
    deviceContext: { deviceId, contextId },
    accessToken,
  } = getActiveUser();
  const configHistory = await getConfigHistory({
    accessToken,
    deviceId,
    contextId,
    asAt,
  });
  const { dataloggerConfigs, sensorConfigs } = configHistory;

  if (asAt) {
    const snapshot: DefaultObject = {};
    const dataloggerConfig = dataloggerConfigs[0];
    snapshot["datalogger"] = dataloggerConfig
      ? {
          config: dataloggerConfig.config,
          createdAt: dataloggerConfig.createdAt,
        }
      : {};
    snapshot["sensors"] =
      sensorConfigs?.map((s) => ({
        [s.name]: { config: s.config, createdAt: s.createdAt },
      })) || [];

    console.log(JSON.stringify(snapshot, null, 2));
    return;
  }

  if (dataloggerConfigs.length) {
    const table = new Table({
      head: ["datalogger config", "changesMade", "createdAt", "deactivatedAt"],
      colWidths: [45, 45, 27, 27],
      wordWrap: true,
      wrapOnWordBoundary: false,
    });

    for (const {
      config,
      changesMade,
      createdAt,
      deactivatedAt,
    } of dataloggerConfigs) {
      table.push(
        [
          { rowSpan: 3, content: JSON.stringify(config), vAlign: "center" },
          {
            rowSpan: 3,
            content: JSON.stringify(changesMade),
            vAlign: "center",
          },
          createdAt,
          deactivatedAt,
        ],
        [],
        []
      );
    }

    console.log("\n" + table.toString());
  }

  if (sensorConfigs.length) {
    const sensorNamesConfigs: Record<string, SensorConfigHistory[]> = {};

    for (const sensorConfig of sensorConfigs) {
      const sensorNameConfigs = sensorNamesConfigs[sensorConfig.name];
      if (sensorNameConfigs) {
        sensorNamesConfigs[sensorConfig.name] = [
          ...sensorNameConfigs,
          sensorConfig,
        ];
      } else {
        sensorNamesConfigs[sensorConfig.name] = [sensorConfig];
      }
    }

    for (const name of Object.keys(sensorNamesConfigs)) {
      const table = new Table({
        head: [`${name} config`, "changesMade", "createdAt", "deactivatedAt"],
        colWidths: [45, 45, 27, 27],
        wordWrap: true,
        wrapOnWordBoundary: false,
      });

      for (const {
        config,
        changesMade,
        createdAt,
        deactivatedAt,
      } of sensorNamesConfigs[name]) {
        table.push(
          [
            { rowSpan: 3, content: JSON.stringify(config), vAlign: "center" },
            {
              rowSpan: 3,
              content: JSON.stringify(changesMade),
              vAlign: "center",
            },
            createdAt,
            deactivatedAt,
          ],
          [],
          []
        );
      }

      console.log("\n" + table.toString());
    }
  }
};
