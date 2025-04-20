import { authUserApiCall } from "../../api/keycloak.ts";
import db from "../../db/db.ts";

export const authenticateUser = async (loginDetails: {
  username: string;
  password: string;
}) => {
  const { username, password } = loginDetails;
  const { accessToken, expiresIn } = await authUserApiCall({
    username,
    password,
  });
  const now = new Date();

  db.update((data) => {
    data.accessToken = accessToken;
    data.expirationTime = +now.setSeconds(now.getSeconds() + expiresIn);
  });

  console.log("authentication successful");
};
