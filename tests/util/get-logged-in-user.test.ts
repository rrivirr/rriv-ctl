import { describe, expect, it } from "vitest";
import db from "../../src/db/db.ts";
import {
  getActiveUser,
  getLoggedInUser,
} from "../../src/util/get-logged-in-user.ts";
import { clearActiveUser, seedUser } from "../helpers/db.ts";

describe("getLoggedInUser", () => {
  it("returns the active user when the token is still valid", () => {
    const { email } = seedUser({ accessToken: "valid-token" });
    const user = getLoggedInUser();
    expect(user?.email).toBe(email);
    expect(user?.accessToken).toBe("valid-token");
    expect(user?.env).toBe("prod");
  });

  it("returns undefined for an expired token", () => {
    seedUser({ expirationTime: Date.now() - 1_000 });
    expect(getLoggedInUser()).toBeUndefined();
  });

  it("can look a user up by email even if not active", () => {
    seedUser({ email: "other@rriv.org" });
    seedUser({ email: "active@rriv.org" });
    const user = getLoggedInUser("other@rriv.org");
    expect(user?.email).toBe("other@rriv.org");
  });

  it("returns undefined for an unknown email", () => {
    seedUser();
    expect(getLoggedInUser("nobody@rriv.org")).toBeUndefined();
  });
});

describe("getActiveUser", () => {
  it("throws when there is no active session", () => {
    clearActiveUser();
    expect(() => getActiveUser()).toThrow();
  });

  it("returns the active session", () => {
    const { email } = seedUser();
    expect(getActiveUser().email).toBe(email);
    expect(db.data.activeEmail).toBe(email);
  });
});
