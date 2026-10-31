import { login, logout, whoami } from "../../modules/auth/auth.service.ts";

export const loginAction = async (email?: string) => {
  await login(email);
};

export const whoamiAction = async () => {
  whoami();
};

export const logoutAction = async () => {
  logout();
};
