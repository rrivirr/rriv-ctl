import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("../../src/infra/s3.ts", () => ({
  s3Client: { send: mocks.send },
  GetObjectCommand: class {
    constructor(public input: unknown) {}
  },
}));

import db from "../../src/db/db.ts";
import { getConfig, setConfig } from "../../src/util/config.ts";
import { seedUser } from "../helpers/db.ts";

describe("getConfig", () => {
  it("falls back to process.env when no environment is selected", () => {
    db.update((data) => {
      delete (data as { environment?: unknown }).environment;
    });
    const config = getConfig();
    expect(config.RRIV_API_URL).toBe("http://rriv-api.test");
    expect(config.KEYCLOAK_CLIENT_ID).toBe("rrivctl");
  });

  it("returns the selected environment's config", () => {
    seedUser({ env: "dev" });
    expect(getConfig().KEYCLOAK_URL).toBe("http://keycloak.test/token");
  });
});

describe("setConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("sets the local environment from process.env", async () => {
    seedUser({ env: "prod" });
    await setConfig("local");
    expect(db.data.environment.name).toBe("local");
    expect(db.data.environment.config.RRIV_API_URL).toBe(
      "http://rriv-api.test",
    );
  });

  it("is a no-op when already in the requested environment", async () => {
    seedUser({ env: "prod" });
    await setConfig("prod");
    expect(mocks.send).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("already in the prod environment");
  });

  it("loads a remote environment config from object storage", async () => {
    seedUser({ env: "prod" });
    mocks.send.mockResolvedValue({
      Body: {
        transformToString: async () =>
          JSON.stringify({ RRIV_API_URL: "http://dev.rriv.org" }),
      },
    });

    await setConfig("dev");

    expect(mocks.send).toHaveBeenCalledTimes(1);
    expect(db.data.environment).toEqual({
      name: "dev",
      config: { RRIV_API_URL: "http://dev.rriv.org" },
    });
  });
});
