import {
  login,
  whoami,
  logout,
  signup,
} from "../../modules/auth/auth.service.ts";

export const signupAction = async (options: any) => {
  await signup(options);
};

export const loginAction = async (email: string) => {
  await login(email);
};

export const whoamiAction = async () => {
  whoami();
};

export const logoutAction = async () => {
  logout();
  console.log("successful");
};
