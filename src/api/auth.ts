import axios from "axios";
import { SignupDto } from "./types.ts";

export const login = async (loginDetails: {
  username: string;
  password: string;
}) => {
  const { username, password } = loginDetails;
  const keycloakUrl = process.env.KEYCLOAK_URL;

  if (!keycloakUrl) {
    throw new Error("keycloak not configured");
  }

  const response = await axios.post(
    keycloakUrl,
    {
      client_id: process.env.KEYCLOAK_CLIENT_ID,
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
  await axios.post(`${process.env.RRIV_API_URL}/account`, body);
};

export const verify = async (body: { email: string }) => {
  const { email } = body;
  await axios.post(`${process.env.RRIV_API_URL}/account/verifyEmail`, {
    email,
  });
};

export const resetPassword = async (body: { email: string }) => {
  const { email } = body;
  await axios.post(`${process.env.RRIV_API_URL}/account/resetPassword`, {
    email,
  });
};
