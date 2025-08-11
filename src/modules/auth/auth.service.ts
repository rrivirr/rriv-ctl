import { authUserApiCall } from "../../api/keycloak.ts";
import db from "../../db/db.ts";
import { passwordPrompt } from "../../prompts/auth.prompt.ts";

export const authenticateUser = async (body: { email: string }) => {
  const { email } = body;
  const password = await passwordPrompt();
  const { accessToken, expiresIn } = await authUserApiCall({
    username: email,
    password,
  });
  const now = new Date();

  db.update((data) => {
    data.accessToken = accessToken;
    data.expirationTime = +now.setSeconds(now.getSeconds() + expiresIn);
  });

  console.log("authentication successful");
};
