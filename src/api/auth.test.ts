import axios from "axios";
import { randomUUID } from "crypto";
import { authUserApiCall } from "./auth.ts";

jest.mock("axios");

describe("Auth API Call", () => {
  const axiosPostMock = axios.post as jest.MockedFunction<typeof axios.post>;

  it("authUserApiCall; invalid keycloak url", async () => {
    process.env.KEYCLOAK_URL = "";
    const resultMock = { accessToken: randomUUID(), expiresIn: 12467890 };
    axiosPostMock.mockResolvedValue({ data: resultMock });
    const username = randomUUID();
    const password = randomUUID();
    expect.assertions(2);

    try {
      await authUserApiCall({
        username,
        password,
      });
    } catch (error: any) {
      expect(error?.message).toEqual("keycloak not configured");
    }
    expect(axiosPostMock).not.toHaveBeenCalled();
  });

  it("authUserApiCall; valid keycloak url", async () => {
    process.env.KEYCLOAK_URL = "https://www.keycloak-api.com";
    process.env.KEYCLOAK_CLIENT_ID = "keycloakServer";
    const resultMock = { accessToken: randomUUID(), expiresIn: 12467890 };
    axiosPostMock.mockResolvedValue({
      data: {
        access_token: resultMock.accessToken,
        expires_in: resultMock.expiresIn,
      },
    });
    const username = randomUUID();
    const password = randomUUID();

    const result = await authUserApiCall({ username, password });
    expect(result).toEqual(resultMock);
    expect(axiosPostMock).toHaveBeenCalledTimes(1);
    expect(axiosPostMock).toHaveBeenCalledWith(
      `https://www.keycloak-api.com`,
      {
        client_id: "keycloakServer",
        username,
        password,
        grant_type: "password",
      },
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
  });
});
