import axios from "axios";
import { rrivApiAxios } from "./axios.ts";
import { SignupDto } from "./types.ts";
import { getConfig } from "../util/config.ts";

export const login = async (loginDetails: {
  username: string;
  password: string;
}) => {
  const { username, password } = loginDetails;
  const config = getConfig();
  const keycloakUrl = config.KEYCLOAK_URL;

  if (!keycloakUrl) {
    throw new Error("keycloak url not configured");
  }

  const response = await axios.post(
    keycloakUrl,
    {
      client_id: config.KEYCLOAK_CLIENT_ID,
      username,
      password,
      grant_type: "password",
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  const { access_token, expires_in } = response.data;
  return {
    accessToken: access_token,
    expiresIn: expires_in,
  };
};

export const signup = async (body: SignupDto) => {
  await rrivApiAxios.post(`/account`, body);
};

export const verify = async (body: { email: string }) => {
  const { email } = body;
  await rrivApiAxios.post(`/account/verifyEmail`, {
    email,
  });
};

export const resetPassword = async (body: { email: string }) => {
  const { email } = body;
  await rrivApiAxios.post(`/account/resetPassword`, {
    email,
  });
};
