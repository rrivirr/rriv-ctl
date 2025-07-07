import Table from "cli-table3";
import {
  getActiveConfigSnapshot,
  getConfigSnapshots,
  overwriteConfigSnapshot,
  saveConfigSnapshot,
} from "../../api/config-snapshot.ts";
import db from "../../db/db.ts";
import { logDeviceContext } from "../../util/log-device-context.ts";
import { logToConsole } from "../../util/console-log.ts";
import { writeConfigToDevice } from "../../util/write-config-to-device.ts";
import { sendCommandAndEchoResponse } from "../../util/send-command-and-echo-response.ts";

export const listConfigSnapshot = async (options: {
  current?: boolean;
  name?: string;
  search?: string;
}) => {
  const { current, name, search } = options;
  const {
    deviceContext: { deviceId, contextId },
    accessToken,
  } = db.data;

  if (current) {
    const configSnapshot = await getActiveConfigSnapshot({
      deviceId,
      contextId,
      accessToken,
    });
    const { dataloggerConfig, sensorConfig } = configSnapshot;
    const table = new Table({
      head: ["name", "config"],
      wordWrap: true,
      wrapOnWordBoundary: false,
      colWidths: [30, 70],
    });
    if (JSON.stringify(dataloggerConfig.config) !== "{}") {
      table.push(
        [
          "datalogger",
          {
            content: JSON.stringify(dataloggerConfig.config),
            rowSpan: 3,
            vAlign: "center",
          },
        ],
        [],
        []
      );
    }
    for (const { name, config } of sensorConfig) {
      table.push(
        [
          name,
          { content: JSON.stringify(config), rowSpan: 3, vAlign: "center" },
        ],
        [],
        []
      );
    }
    console.log(table.toString());
    logDeviceContext();
  } else {
    const configSnapshots = await getConfigSnapshots({
      name,
      accessToken,
      search,
    });
    if (!configSnapshots.length) {
      logToConsole("no save config snapshots found");
      return;
    }
    for (const {
      name: configSnapshotName,
      DataloggerConfig,
      SensorConfig,
    } of configSnapshots) {
      const table = new Table({
        head: ["configSnapshotName", "name", "config"],
        wordWrap: true,
        wrapOnWordBoundary: false,
        colWidths: [25, 25, 80],
      });
      if (DataloggerConfig.length) {
        table.push(
          [
            { content: configSnapshotName, rowSpan: 3 },
            "datalogger",
            {
              content: JSON.stringify(DataloggerConfig[0].config),
              rowSpan: 3,
              vAlign: "center",
            },
          ],
          [],
          []
        );
      }

      for (const [index, { name, config }] of SensorConfig.entries()) {
        table.push(
          [
            {
              content:
                index === 0 && !DataloggerConfig.length
                  ? configSnapshotName
                  : "",
              rowSpan: 3,
            },
            name,
            { content: JSON.stringify(config), rowSpan: 3, vAlign: "center" },
          ],
          [],
          []
        );
      }
      console.log(table.toString());
    }
  }
};

export const saveCurrentSnapshot = async (body: { name: string }) => {
  const {
    deviceContext: { deviceId, contextId },
    accessToken,
  } = db.data;
  await saveConfigSnapshot({ ...body, deviceId, contextId, accessToken });
  logToConsole("current config snapshot saved successfully");
};

export const applySavedConfigSnapshot = async (body: { name: string }) => {
  const { name } = body;

  const { accessToken } = db.data;

  const configSnapshots = await getConfigSnapshots({
    name,
    accessToken,
  });

  if (!configSnapshots.length) {
    logToConsole(`no saved config snapshot found with name: ${name} found`);
    return;
  }

  const configSnapshotToApply = configSnapshots[0];
  const { DataloggerConfig, SensorConfig } = configSnapshotToApply;

  await applyConfigSnapshot({
    datalogger: {
      config: DataloggerConfig[0]?.config,
      configId: DataloggerConfig[0]?.id,
    },
    sensor: SensorConfig.map((s) => ({
      config: s.config,
      configId: s.id,
    })),
  });
};

export const applyConfigSnapshot = async (body: {
  datalogger: { config: object; configId: string };
  sensor: { config: object; configId: string }[];
}) => {
  const { datalogger, sensor } = body;
  const {
    deviceContext: { deviceId, contextId },
    accessToken,
  } = db.data;

  // remove previous config
  sendCommandAndEchoResponse(
    JSON.stringify({ action: "remove", object: "datalogger" })
  );
  sendCommandAndEchoResponse(
    JSON.stringify({ action: "remove", object: "actuator" })
  );
  sendCommandAndEchoResponse(
    JSON.stringify({ action: "remove", object: "sensor" })
  );

  // apply config to the device
  if (datalogger?.config) {
    writeConfigToDevice(datalogger.config);
  }
  for (const { config } of sensor) {
    writeConfigToDevice(config);
  }

  if (datalogger?.config || sensor.length) {
    // add function to queue if call fails confirm from upload config
    await overwriteConfigSnapshot({
      deviceId,
      contextId,
      accessToken,
      sensorConfigIds: sensor.map((s) => s.configId),
      dataloggerConfigId: datalogger.configId,
    });
  }

  logToConsole("success");
};
