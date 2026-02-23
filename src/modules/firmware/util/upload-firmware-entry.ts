import { randomUUID } from "crypto";
import { createFirmwareHistoryEntry } from "../../../api/device.ts";
import { SyncDataType } from "../../../constants.ts";
import { getActiveUser } from "../../../util/get-logged-in-user.ts";
import db from "../../../db/db.ts";
import { errorHandler } from "../../../util/error-handler.ts";

export const uploadFirmwareEntry = async (versionFlashed: string) => {
  const {
    deviceContext: { deviceId, contextId },
    email,
    env,
    device: { id },
  } = getActiveUser();

  if (id && id !== "guest") {
    const dataToUpload = {
      version: versionFlashed,
      installedAt: new Date().toISOString(),
      deviceId,
      contextId,
    };
    try {
      await createFirmwareHistoryEntry({ ...dataToUpload });
    } catch (error) {
      db.update((data) => {
        data[email][env].toSync = [
          {
            requestId: randomUUID(),
            data: dataToUpload,
            type: SyncDataType.FirmwareHistory,
          },
        ];
      });
      console.log("firmware cloud upload failed");
      errorHandler({ error, exit: true });
    }
  }
};
