import { describe, expect, it } from "vitest";
import db from "../../src/db/db.ts";
import { seedUser } from "../helpers/db.ts";

describe("db sessions", () => {
  it("initializes a session from the main db and restores it on reset", () => {
    // NOTE: lowdb swaps to an in-memory adapter when NODE_ENV=test, so the
    // session file is not written here; we assert the in-memory behaviour.
    const { email } = seedUser();

    const sessionId = db.initializeSessionDb();

    expect(sessionId).toMatch(/^session-/);
    expect(db.data.activeEmail).toBe(email);
    expect(db.data[email]).toBeDefined();

    db.resetDb();
    expect(db.data.activeEmail).toBe(email);
  });
});
