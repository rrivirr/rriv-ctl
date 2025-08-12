import { signup } from "../../modules/auth/auth.service.ts";

export const signupAction = async (options: any) => {
  await signup(options);
};
