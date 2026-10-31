import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getLoggedInUser: vi.fn(),
  login: vi.fn(),
}));

vi.mock("../../src/util/get-logged-in-user.ts", () => ({
  getLoggedInUser: mocks.getLoggedInUser,
}));
vi.mock("../../src/modules/auth/auth.service.ts", () => ({
  login: mocks.login,
}));

import { authCheck } from "../../src/util/auth-check.ts";

describe("authCheck", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("prompts login when there is no user", async () => {
    mocks.getLoggedInUser.mockReturnValue(undefined);
    await authCheck();
    expect(mocks.login).toHaveBeenCalledTimes(1);
  });

  it("does nothing when a user is logged in", async () => {
    mocks.getLoggedInUser.mockReturnValue({ accessToken: "t" });
    await authCheck();
    expect(mocks.login).not.toHaveBeenCalled();
  });
});
