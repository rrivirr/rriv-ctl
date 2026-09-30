import { beforeEach, describe, expect, it, vi } from "vitest";

interface CapturedConfig {
  url?: string;
  headers: Record<string, string>;
}

const mocks = vi.hoisted(() => ({
  interceptor: undefined as
    | undefined
    | ((config: CapturedConfig) => Promise<CapturedConfig>),
}));

vi.mock("axios", async () => {
  const { vi: v } = await import("vitest");
  const create = v.fn(() => ({
    interceptors: {
      request: {
        use: (fn: (config: CapturedConfig) => Promise<CapturedConfig>) => {
          mocks.interceptor = fn;
        },
      },
    },
  }));
  return { default: { create } };
});

import { seedUser } from "../helpers/db.ts";
import "../../src/api/axios.ts";

const run = (url: string) =>
  mocks.interceptor!({ url, headers: {} as Record<string, string> });

describe("api/axios request interceptor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("attaches the active user's bearer token", async () => {
    seedUser({ accessToken: "tok-123" });
    const config = await run("/context");
    expect(config.headers.Authorization).toBe("Bearer tok-123");
  });

  it("skips the token for /account requests", async () => {
    seedUser({ accessToken: "tok-123" });
    const config = await run("/account");
    expect(config.headers.Authorization).toBeUndefined();
  });
});
