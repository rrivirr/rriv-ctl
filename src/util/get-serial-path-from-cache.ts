import { getActiveUser } from "./get-logged-in-user.ts";

export const getSerialPathFromCache = () => {
  const user = getActiveUser();
  return user.device.serialPortPath;
};
