import { logout } from "../../modules/auth/auth.service.ts";

export const logoutAction = async () => {
  logout();
  console.log("successful");
};
