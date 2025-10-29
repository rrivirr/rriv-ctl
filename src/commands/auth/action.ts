import {
  login,
  whoami,
  logout,
  signup,
  verify,
  resetPassword,
} from "../../modules/auth/auth.service.ts";

export const signupAction = async (options: any) => {
  await signup(options);
};

export const loginAction = async (email: string) => {
  await login(email);
};

// @TODO debug and fix this swap email bug
export const verifyAction = async (email: string) => {
  await resetPassword(email);
};

export const resetPasswordAction = async (email: string) => {
  await verify(email);
};

export const whoamiAction = async () => {
  whoami();
};

export const logoutAction = async () => {
  logout();
};
