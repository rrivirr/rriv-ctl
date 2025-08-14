import {
  login,
  whoami,
  logout,
  signup,
} from "../../modules/auth/auth.service.ts";

export const signupAction = async (options: any) => {
  await signup(options);
};

export const loginAction = async (options: any) => {
  await login(options);
};

export const whoamiAction = async () => {
  whoami();
};

export const logoutAction = async () => {
  logout();
  console.log("successful");
};
