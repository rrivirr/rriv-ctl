import { updateDeviceContext } from "../../api/device-context.ts";
import db from "../../db/db.ts";

export const endDeviceContext = async () => {
  const {
    deviceContext: { deviceId, contextId },
    accessToken,
  } = db.data;

  await updateDeviceContext({ deviceId, contextId, accessToken, end: true });
  db.update((data) => {
    data.deviceContext = {
      contextId: "",
      deviceId: "",
      assignedDeviceName: "",
    };
  });
};
