import db from "../db/db.ts";

export const getSerialPathFromCache = () => {
  return db.data.device.serialPortPath;
};
