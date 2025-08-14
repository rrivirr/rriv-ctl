import db from "../db/db.ts";
import * as authPromptModule from "../prompts/auth.prompt.ts";
import * as keycloak from "../api/auth.ts";
import { authUser } from "./auth-user.ts";

describe("authUser", () => {
  const authPromptSpy = jest.spyOn(authPromptModule, "authPrompt");
  const loginApiCallSpy = jest.spyOn(keycloak, "login");

  it("should get new accessToken; previous token expired", async () => {
    const now = new Date();
    db.update((data) => {
      data.accessToken = "accessToken";
      data.expirationTime = +now.setSeconds(now.getSeconds() - 1);
    });

    authPromptSpy.mockResolvedValue({ email: "jack", password: "sparrow" });
    loginApiCallSpy.mockResolvedValue({
      accessToken: "newAccessToken",
      expiresIn: 4444,
    });

    const result = await authUser();
    expect(result).toEqual("newAccessToken");
    expect(authPromptSpy).toHaveBeenCalled();
    expect(loginApiCallSpy).toHaveBeenCalledWith({
      username: "jack",
      password: "sparrow",
    });
  });

  it("should returning existing accessToken; not expired", async () => {
    const now = new Date();
    db.update((data) => {
      data.accessToken = "accessToken";
      data.expirationTime = +now.setSeconds(now.getSeconds() + 7);
    });

    const result = await authUser();
    expect(result).toEqual("accessToken");
    expect(authPromptSpy).not.toHaveBeenCalled();
    expect(loginApiCallSpy).not.toHaveBeenCalled();
  });
});
