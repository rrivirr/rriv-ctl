import { LowSync } from "lowdb";
import { authPrompt } from "../prompts/auth.prompt.ts";
import { Data } from "../db/db.ts";
import { authUserApiCall } from "../api/keycloak.ts";

export const authUser = async (db: LowSync<Data>) => {
  const { expirationTime, accessToken: existingAccessToken } = db.data;

  if (new Date() < new Date(expirationTime)) {
    return existingAccessToken;
  }

  const loginDetails = await authPrompt();
  const { accessToken, expiresIn } = await authUserApiCall(loginDetails);
  const now = new Date();

  db.update((data) => {
    data.accessToken = accessToken;
    data.expirationTime = +now.setSeconds(now.getSeconds() + expiresIn);
  });

  return accessToken;
};
