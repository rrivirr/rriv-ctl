import { updateContext } from "../../api/context.ts";
import db from "../../db/db.ts";

export const endContext = async () => {
  const {
    context: { id },
    accessToken,
  } = db.data;

  await updateContext({ id, accessToken, end: true });
  db.update((data) => {
    data.context = { id: "", name: "" };
    data.deviceContext = {
      contextId: "",
      deviceId: "",
      assignedDeviceName: "",
    };
  });
};
