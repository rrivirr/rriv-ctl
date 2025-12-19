import Table from "cli-table3";
import { getConfigHistory } from "../../api/config-snapshot.ts";
import {
  DataloggerConfigHistory,
  SensorConfigHistory,
} from "../../api/types.ts";
import { DefaultObject } from "../../types.ts";
import { getActiveUser } from "../../util/get-logged-in-user.ts";
import { getDataloggerConfigHistory } from "../../api/datalogger.ts";
import { getSensorConfigHistory } from "../../api/sensor.ts";
import { greenBright, redBright, yellowBright, reset } from "yoctocolors";
import { applyConfigSnapshot } from "./config-snapshot.service.ts";

const modifyChangesMade = (changesMade: object) => {
  if (!changesMade) return "";
  const modifiedChangesMade: string[] = [];
  for (const [key, value] of Object.entries(changesMade)) {
    if (value.includes("removed")) {
      modifiedChangesMade.push(`${reset(key)}: ${redBright(value)}`);
    } else if (value.includes("added")) {
      modifiedChangesMade.push(`${reset(key)}: ${greenBright(value)}`);
    } else {
      modifiedChangesMade.push(`${reset(key)}: ${yellowBright(value)}`);
    }
  }
  return modifiedChangesMade.join(", ");
};

export const listConfigHistory = async (body: {
  deviceId?: string;
  limit?: number;
  sensorId?: string;
  resource: string;
}) => {
  const { deviceId: specifiedDeviceId, limit, sensorId, resource } = body;
  const {
    deviceContext: { deviceId: connectedDeviceId },
  } = getActiveUser();
  const deviceId = specifiedDeviceId || connectedDeviceId;

  if (!deviceId) {
    throw new Error("no deviceId specified");
  }
  let dataloggerConfigs: DataloggerConfigHistory[] = [];
  let sensorConfigs: SensorConfigHistory[] = [];

  if (resource === "device") {
    const configHistory = await getConfigHistory({
      deviceId,
      limit,
      sensorName: sensorId,
    });

    dataloggerConfigs = configHistory.dataloggerConfigs;
    sensorConfigs = configHistory.sensorConfigs;
  } else if (resource === "datalogger") {
    const dataloggerConfigHistory = await getDataloggerConfigHistory({
      deviceId,
      limit,
    });
    dataloggerConfigs = dataloggerConfigHistory;
  } else if (resource === "sensor") {
    const sensorConfigHistory = await getSensorConfigHistory({
      deviceId,
      limit,
      sensorName: sensorId,
    });
    sensorConfigs = sensorConfigHistory;
  }

  if (dataloggerConfigs.length) {
    const table = new Table({
      head: [
        "datalogger config",
        "context",
        "changesMade",
        "createdAt",
        "deactivatedAt",
      ],
      colWidths: [45, 15, 45, 26, 26],
      wordWrap: true,
      wrapOnWordBoundary: false,
    });

    for (const {
      config,
      ConfigSnapshot: {
        DeviceContext: {
          Context: { name: contextName },
        },
      },
      changesMade,
      createdAt,
      deactivatedAt,
    } of dataloggerConfigs) {
      table.push(
        [
          { rowSpan: 3, content: JSON.stringify(config), vAlign: "center" },
          contextName,
          {
            rowSpan: 3,
            content: modifyChangesMade(changesMade),
            vAlign: "center",
            hAlign: "center",
            wrapOnWordBoundary: true,
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
        head: [
          `${name} config`,
          "context",
          "changesMade",
          "createdAt",
          "deactivatedAt",
        ],
        colWidths: [45, 15, 45, 26, 26],
        wordWrap: true,
        wrapOnWordBoundary: false,
      });

      for (const {
        config,
        ConfigSnapshot: {
          DeviceContext: {
            Context: { name: contextName },
          },
        },
        changesMade,
        createdAt,
        deactivatedAt,
      } of sensorNamesConfigs[name]) {
        table.push(
          [
            { rowSpan: 3, content: JSON.stringify(config), vAlign: "center" },
            contextName,
            {
              rowSpan: 3,
              content: modifyChangesMade(changesMade),
              vAlign: "center",
              hAlign: "center",
              wrapOnWordBoundary: true,
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

export const getConfigHistoryAtTime = async (body: {
  deviceId?: string;
  sensorId?: string;
  resource: string;
  datetimeNumber: number;
  returnResult?: boolean;
}) => {
  const {
    deviceId: specifiedDeviceId,
    datetimeNumber,
    sensorId,
    resource,
    returnResult,
  } = body;
  const {
    deviceContext: { deviceId: connectedDeviceId },
  } = getActiveUser();
  const deviceId = specifiedDeviceId || connectedDeviceId;
  const datetime = new Date(datetimeNumber).toISOString();

  let dataloggerConfigs: DataloggerConfigHistory[] = [];
  let sensorConfigs: SensorConfigHistory[] = [];

  if (resource === "device") {
    const configHistory = await getConfigHistory({
      deviceId,
      asAt: datetime,
      sensorName: sensorId,
    });

    dataloggerConfigs = configHistory.dataloggerConfigs;
    sensorConfigs = configHistory.sensorConfigs;
  } else if (resource === "datalogger") {
    const dataloggerConfigHistory = await getDataloggerConfigHistory({
      deviceId,
      asAt: datetime,
    });
    dataloggerConfigs = dataloggerConfigHistory;
  } else if (resource === "sensor") {
    const sensorConfigHistory = await getSensorConfigHistory({
      deviceId,
      asAt: datetime,
      sensorName: sensorId,
    });
    sensorConfigs = sensorConfigHistory;
  }

  const snapshot: DefaultObject = {};
  const dataloggerConfig = dataloggerConfigs[0];
  if (dataloggerConfig) {
    snapshot["datalogger"] = {
      id: dataloggerConfig.id,
      config: dataloggerConfig.config,
      createdAt: dataloggerConfig.createdAt,
    };
  }

  if (sensorConfigs.length) {
    snapshot["sensors"] = sensorConfigs.map((s) => ({
      id: s.id,
      name: s.name,
      config: s.config,
      createdAt: s.createdAt,
    }));
  }

  if (returnResult) {
    return snapshot;
  }
  console.log(JSON.stringify(snapshot, null, 2));
};

export const applyConfigHistory = async (body: {
  deviceId?: string;
  sensorId?: string;
  resource: string;
  datetimeNumber: number;
}) => {
  const configHistory = await getConfigHistoryAtTime({
    ...body,
    returnResult: true,
  });
  if (!configHistory || !Object.keys(configHistory).length) {
    throw new Error("no snapshot found at specified timestamp");
  }

  const snapshot = {} as Parameters<typeof applyConfigSnapshot>[0];
  const dataloggerConfig = configHistory?.datalogger;

  snapshot["datalogger"] = dataloggerConfig
    ? {
        config: dataloggerConfig.config,
        configId: dataloggerConfig.id,
      }
    : {};
  snapshot["sensor"] =
    configHistory?.sensors?.map((s: any) => ({
      config: s.config,
      configId: s.id,
      name: s.name,
    })) || [];

  await applyConfigSnapshot(snapshot);
};
