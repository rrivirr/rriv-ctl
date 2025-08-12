import { authPrompt } from "../prompts/auth.prompt.ts";
import { authUserApiCall } from "../api/auth.ts";
import db from "../db/db.ts";

export const authUser = async () => {
  const { expirationTime, accessToken: existingAccessToken } = db.data;

  if (Date.now() < expirationTime) {
    return existingAccessToken;
  }

  const loginDetails = await authPrompt();
  const { email, password } = loginDetails;
  const { accessToken, expiresIn } = await authUserApiCall({
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
