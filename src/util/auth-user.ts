import { authPrompt } from "../prompts/auth.prompt.ts";
import { login as loginUserApiCall } from "../api/auth.ts";
import db from "../db/db.ts";
import { logout } from "../modules/auth/auth.service.ts";

export const authUser = async () => {
  const { expirationTime, accessToken: existingAccessToken } = db.data;

  if (Date.now() < expirationTime && existingAccessToken) {
    return existingAccessToken;
  }

  logout();

  const loginDetails = await authPrompt();
  const { email, password } = loginDetails;
  const { accessToken, expiresIn } = await loginUserApiCall({
    username: email,
    password,
  });
  const now = new Date();

  db.update((data) => {
    data.accessToken = accessToken;
    data.expirationTime = +now.setSeconds(now.getSeconds() + expiresIn);
  });

  return accessToken;
};
