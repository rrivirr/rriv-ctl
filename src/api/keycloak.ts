import axios from "axios";

export const authUserApiCall = async (loginDetails: {
  username: string;
  password: string;
}) => {
  const { username, password } = loginDetails;
  const response = await axios.post(
    process.env.KEYCLOAK_URL!,
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
