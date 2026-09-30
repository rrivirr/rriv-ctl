import { OverwriteConfigSnapshotDto } from "./types.ts";
import { rrivApiAxios } from "./axios.ts";

export const overwriteConfigSnapshot = async (
  body: OverwriteConfigSnapshotDto,
): Promise<void> => {
  const {
    dataloggerConfigId,
    sensorConfigIds,
    deviceId,
    contextId,
    createdAt,
  } = body;

  await rrivApiAxios.put(`/configSnapshot/active`, {
    dataloggerConfigId,
    sensorConfigIds,
    deviceId,
    contextId,
    createdAt,
  });
};
