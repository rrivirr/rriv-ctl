import { whoami } from "../../modules/auth/auth.service.ts";

export const whoamiAction = async () => {
  whoami();
};
