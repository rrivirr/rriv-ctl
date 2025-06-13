import Table from "cli-table3";
import {
  getActiveConfigSnapshot,
  getConfigSnapshots,
  saveConfigSnapshot,
} from "../../api/config-snapshot.ts";
import db from "../../db/db.ts";
import { logDeviceContext } from "../../util/log-device-context.ts";
import { logToConsole } from "../../util/console-log.ts";

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
    for (const { name, DataloggerConfig, SensorConfig } of configSnapshots) {
      const table = new Table({
        head: ["configSnapshotName", "name", "config"],
        wordWrap: true,
        wrapOnWordBoundary: false,
        colWidths: [25, 25, 80],
      });
      table.push(
        [
          { content: name, rowSpan: 3 },
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
      for (const { name, config } of SensorConfig) {
        table.push(
          [
            { content: "", rowSpan: 3 },
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
