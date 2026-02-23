import { getLoggedInUser } from "./get-logged-in-user.ts";
import { login } from "../modules/auth/auth.service.ts";

export const authCheck = async () => {
  const user = getLoggedInUser();

  if (!user) {
    await login();
  }
};
