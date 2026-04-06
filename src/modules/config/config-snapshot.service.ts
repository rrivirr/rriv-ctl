import Table from "cli-table3";
import { randomUUID } from "crypto";
import {
  getActiveConfigSnapshot,
  getConfigSnapshots,
  overwriteConfigSnapshot,
  saveConfigSnapshot,
} from "../../api/config-snapshot.ts";
import db from "../../db/db.ts";
import { writeConfigToDevice } from "../../infra/write-config-to-device.ts";
import { errorHandler } from "../../util/error-handler.ts";
import { SyncDataType } from "../../constants.ts";
import { getActiveUser } from "../../util/get-logged-in-user.ts";

export const getConfigSnapshot = async () => {
  const {
    deviceContext: { deviceId, contextId },
  } = getActiveUser();

  const configSnapshot = await getActiveConfigSnapshot({
    deviceId,
    contextId,
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
      [],
    );
  }
  for (const { name, config } of sensorConfig) {
    table.push(
      [name, { content: JSON.stringify(config), rowSpan: 3, vAlign: "center" }],
      [],
      [],
    );
  }
  console.log("\n" + table.toString());
};

export const listConfigSnapshot = async (options: {
  name?: string;
  search?: string;
}) => {
  const { name, search } = options;

  const configSnapshots = await getConfigSnapshots({
    name,
    search,
  });
  if (!configSnapshots.length) {
    console.log("no saved config snapshots found");
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
        [],
      );
    }

    for (const [index, { name, config }] of SensorConfig.entries()) {
      table.push(
        [
          {
            content:
              index === 0 && !DataloggerConfig.length ? configSnapshotName : "",
            rowSpan: 3,
          },
          name,
          { content: JSON.stringify(config), rowSpan: 3, vAlign: "center" },
        ],
        [],
        [],
      );
    }
    console.log("\n" + table.toString());
  }
};

export const saveCurrentSnapshot = async (body: { name: string }) => {
  const {
    deviceContext: { deviceId, contextId },
  } = getActiveUser();
  await saveConfigSnapshot({ ...body, deviceId, contextId });
  console.log("current config snapshot saved successfully");
};

export const applySavedConfigSnapshot = async (body: { name: string }) => {
  const { name } = body;

  const configSnapshots = await getConfigSnapshots({
    name,
  });

  if (!configSnapshots.length) {
    console.log(`no saved config snapshot found with name: ${name} found`);
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
      name: s.name,
    })),
  });
};

export const applyConfigSnapshot = async (body: {
  datalogger: { config?: object; configId?: string };
  sensor: { config: object; configId: string; name: string }[];
}) => {
  const { datalogger, sensor } = body;
  const {
    deviceContext: { deviceId, contextId },
    toSync,
    email,
    env,
  } = getActiveUser();

  // @TODO remove all sensors?
  // await sendCommandAndEchoResponse(
  //   JSON.stringify({ action: "remove", object: "datalogger" })
  // );
  // await sendCommandAndEchoResponse(
  //   JSON.stringify({ action: "remove", object: "actuator" })
  // );
  // await sendCommandAndEchoResponse(
  //   JSON.stringify({ action: "remove", object: "sensor" })
  // );

  // apply config to the device
  if (datalogger?.config) {
    await writeConfigToDevice(datalogger.config);
  }
  for (const { config, name } of sensor) {
    await writeConfigToDevice({ ...config, id: name.toLowerCase() });
  }

  if (datalogger?.config || sensor.length) {
    const dataToUpload = {
      deviceId,
      contextId,
      sensorConfigIds: sensor.map((s) => s.configId),
      dataloggerConfigId: datalogger.configId,
      createdAt: new Date().toISOString(),
    };
    if (toSync?.length) {
      db.update((data) => {
        data[email][env].toSync = [
          ...toSync,
          {
            requestId: randomUUID(),
            data: dataToUpload,
            type: SyncDataType.ConfigSnapshot,
          },
        ];
      });
    } else {
      try {
        await overwriteConfigSnapshot({ ...dataToUpload });
        console.log("config uploaded to cloud successfully");
      } catch (error) {
        db.update((data) => {
          data[email][env].toSync = [
            {
              requestId: randomUUID(),
              data: dataToUpload,
              type: SyncDataType.ConfigSnapshot,
            },
          ];
        });
        console.log("cloud upload failed");
        await errorHandler({ error });
      }
    }
  }
};
