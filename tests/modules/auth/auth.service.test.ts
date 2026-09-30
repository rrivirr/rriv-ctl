import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loginApiCall: vi.fn(),
  passwordPrompt: vi.fn(),
}));

vi.mock("../../../src/api/auth.ts", () => ({ login: mocks.loginApiCall }));
vi.mock("../../../src/prompts/auth.prompt.ts", () => ({
  passwordPrompt: mocks.passwordPrompt,
}));

import db from "../../../src/db/db.ts";
import { login, logout, whoami } from "../../../src/modules/auth/auth.service.ts";
import { getLoggedInUser } from "../../../src/util/get-logged-in-user.ts";
import { clearActiveUser, seedUser } from "../../helpers/db.ts";

const base64url = (value: Record<string, unknown>) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");

const fakeJwt = () =>
  `${base64url({ alg: "none" })}.${base64url({ name: "Test User" })}.sig`;

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("logs in, stores the user, and decodes the token name", async () => {
    seedUser({ email: "seed@rriv.org" }); // establish the environment
    const token = fakeJwt();
    mocks.passwordPrompt.mockResolvedValue("pw");
    mocks.loginApiCall.mockResolvedValue({ accessToken: token, expiresIn: 300 });

    await login("new@rriv.org");

    const user = getLoggedInUser("new@rriv.org");
    expect(user?.accessToken).toBe(token);
    expect(user?.name).toBe("Test User");
    expect(mocks.loginApiCall).toHaveBeenCalledWith({
      username: "new@rriv.org",
      password: "pw",
    });
  });

  it("does not prompt when the user already has a valid token", async () => {
    seedUser({ email: "cached@rriv.org", accessToken: "cached" });

    await login("cached@rriv.org");

    expect(mocks.passwordPrompt).not.toHaveBeenCalled();
    expect(mocks.loginApiCall).not.toHaveBeenCalled();
  });

  it("switches the active user to another cached user", async () => {
    seedUser({ email: "a@rriv.org" });
    seedUser({ email: "b@rriv.org" });

    await login("a@rriv.org");

    expect(db.data.activeEmail).toBe("a@rriv.org");
    expect(mocks.passwordPrompt).not.toHaveBeenCalled();
  });

  it("asks for an email and exits when none is available", async () => {
    seedUser();
    clearActiveUser();
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as never);
    mocks.passwordPrompt.mockResolvedValue("pw");
    mocks.loginApiCall.mockResolvedValue({
      accessToken: fakeJwt(),
      expiresIn: 300,
    });

    await login();

    expect(exitSpy).toHaveBeenCalled();
  });

  it("explains an unverified email and does not rethrow", async () => {
    seedUser({ email: "seed@rriv.org" });
    mocks.passwordPrompt.mockResolvedValue("pw");
    mocks.loginApiCall.mockRejectedValue({
      response: { data: { error_description: "Account is not fully set up" } },
    });

    await login("unverified@rriv.org");

    expect(String((console.log as never as { mock: { calls: unknown[][] } }).mock.calls.flat())).toContain(
      "verify your email",
    );
  });

  it("rethrows a login error that is not an API response", async () => {
    seedUser({ email: "seed@rriv.org" });
    mocks.passwordPrompt.mockResolvedValue("pw");
    mocks.loginApiCall.mockRejectedValue(new Error("network"));

    await expect(login("x@rriv.org")).rejects.toThrow("network");
  });

  it("logs out by clearing the active user's session", () => {
    seedUser({ accessToken: "token" });
    expect(getLoggedInUser()?.accessToken).toBe("token");

    logout();

    expect(getLoggedInUser()).toBeUndefined();
    expect(console.log).toHaveBeenCalledWith("successful");
  });

  it("logout is a no-op when nobody is logged in", () => {
    clearActiveUser();
    logout();
    expect(console.log).toHaveBeenCalledWith("successful");
  });

  it("whoami prints a message when nobody is logged in", async () => {
    clearActiveUser();
    await whoami();
    expect(console.log).toHaveBeenCalledWith("no user logged in at the moment");
  });

  it("whoami prints a table for the active user", async () => {
    seedUser({ email: "who@rriv.org" });
    await whoami();
    expect(console.log).toHaveBeenCalledTimes(1);
    const printed = (console.log as unknown as { mock: { calls: unknown[][] } })
      .mock.calls[0][0] as string;
    expect(printed).toContain("who@rriv.org");
    expect(printed).toContain("name");
  });
});
