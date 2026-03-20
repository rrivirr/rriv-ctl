import Table from "cli-table3";
import { getConfigHistory } from "../../api/config-snapshot.ts";
import {
  DataloggerConfigHistory,
  SensorConfigHistory,
} from "../../api/types.ts";
import { DefaultObject, Resource } from "../../types.ts";
import { getActiveUser } from "../../util/get-logged-in-user.ts";
import { getDataloggerConfigHistory } from "../../api/datalogger.ts";
import { getSensorConfigHistory } from "../../api/sensor.ts";
import { greenBright, redBright, yellowBright, reset } from "yoctocolors";
import { applyConfigSnapshot } from "./config-snapshot.service.ts";

const modifyChangesMade = (changesMade: object) => {
  if (!changesMade) return "";
  const modifiedChangesMade: string[] = [];
  for (const [key, value] of Object.entries(changesMade)) {
    if (value?.includes("removed")) {
      modifiedChangesMade.push(`${reset(key)}: ${redBright(value)}`);
    } else if (value?.includes("added")) {
      modifiedChangesMade.push(`${reset(key)}: ${greenBright(value)}`);
    } else {
      modifiedChangesMade.push(`${reset(key)}: ${yellowBright(value)}`);
    }
  }
  return modifiedChangesMade.join(", ");
};

export const listConfigHistory = async (body: {
  deviceIdentifier?: string;
  limit?: number;
  sensorId?: string;
  resource: Resource;
}) => {
  const {
    deviceIdentifier: specifiedDeviceIdentifier,
    limit,
    sensorId,
    resource,
  } = body;
  const {
    device: { serialNumber },
  } = getActiveUser();
  const deviceIdentifier = specifiedDeviceIdentifier || serialNumber;

  if (!deviceIdentifier) {
    throw new Error("no connected device/deviceId specified");
  }
  let dataloggerConfigs: DataloggerConfigHistory[] = [];
  let sensorConfigs: SensorConfigHistory[] = [];

  if (resource === "device") {
    const configHistory = await getConfigHistory({
      deviceIdentifier,
      limit,
    });

    dataloggerConfigs = configHistory.dataloggerConfigs;
    sensorConfigs = configHistory.sensorConfigs;
  } else if (resource === "datalogger") {
    const dataloggerConfigHistory = await getDataloggerConfigHistory({
      deviceIdentifier,
      limit,
    });
    dataloggerConfigs = dataloggerConfigHistory;
  } else if (resource === "sensor") {
    const sensorConfigHistory = await getSensorConfigHistory({
      deviceIdentifier,
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
        [],
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
          [],
        );
      }

      console.log("\n" + table.toString());
    }
  }
};

export const getConfigHistoryAtTime = async (body: {
  deviceIdentifier?: string;
  sensorId?: string;
  resource: Resource;
  datetime: string;
  returnResult?: boolean;
}) => {
  const {
    deviceIdentifier: specifiedDeviceIdentifier,
    datetime,
    sensorId,
    resource,
    returnResult,
  } = body;
  const {
    device: { serialNumber },
  } = getActiveUser();
  const deviceIdentifier = specifiedDeviceIdentifier || serialNumber;

  if (!deviceIdentifier) {
    throw new Error("no connected device/deviceIdentifier specified");
  }

  let dataloggerConfigs: DataloggerConfigHistory[] = [];
  let sensorConfigs: SensorConfigHistory[] = [];

  if (resource === "device") {
    const configHistory = await getConfigHistory({
      deviceIdentifier,
      asAt: datetime,
    });

    dataloggerConfigs = configHistory.dataloggerConfigs;
    sensorConfigs = configHistory.sensorConfigs;
  } else if (resource === "datalogger") {
    const dataloggerConfigHistory = await getDataloggerConfigHistory({
      deviceIdentifier,
      asAt: datetime,
    });
    dataloggerConfigs = dataloggerConfigHistory;
  } else if (resource === "sensor") {
    const sensorConfigHistory = await getSensorConfigHistory({
      deviceIdentifier,
      asAt: datetime,
      sensorName: sensorId,
    });
    sensorConfigs = sensorConfigHistory;
  }

  const snapshot: DefaultObject = {};
  const snapshotToLog: DefaultObject = {};
  const dataloggerConfig = dataloggerConfigs[0];
  if (dataloggerConfig) {
    snapshot["datalogger"] = {
      id: dataloggerConfig.id,
      config: dataloggerConfig.config,
      createdAt: dataloggerConfig.createdAt,
    };
    snapshotToLog["datalogger"] = {
      ...dataloggerConfig.config,
    };
  }

  if (sensorConfigs.length) {
    snapshot["sensors"] = sensorConfigs.map((s) => ({
      id: s.id,
      name: s.name,
      config: s.config,
      createdAt: s.createdAt,
    }));
    snapshotToLog["sensors"] = sensorConfigs.map((s) => ({
      id: s.name,
      ...s.config,
    }));
  }

  if (returnResult) {
    return { snapshot, snapshotToLog };
  }
  console.log(JSON.stringify(snapshotToLog, null, 2));
};

export const applyConfigHistory = async (body: {
  deviceIdentifier?: string;
  sensorId?: string;
  resource: Resource;
  datetime: string;
}) => {
  const configHistory = await getConfigHistoryAtTime({
    ...body,
    returnResult: true,
  });
  if (!configHistory || !Object.keys(configHistory.snapshot).length) {
    throw new Error("no snapshot found at specified timestamp");
  }

  const { snapshot: snapshotHistory } = configHistory;

  const snapshot = {} as Parameters<typeof applyConfigSnapshot>[0];
  const dataloggerConfig = snapshotHistory?.datalogger;

  snapshot["datalogger"] = dataloggerConfig
    ? {
        config: dataloggerConfig.config,
        configId: dataloggerConfig.id,
      }
    : {};
  snapshot["sensor"] =
    snapshotHistory?.sensors?.map((s: any) => ({
      config: s.config,
      configId: s.id,
      name: s.name,
    })) || [];

  await applyConfigSnapshot(snapshot);
};
