import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listReleases: vi.fn(),
  getLatestRelease: vi.fn(),
}));

vi.mock("@octokit/rest", () => ({
  Octokit: class {
    repos = {
      listReleases: mocks.listReleases,
      getLatestRelease: mocks.getLatestRelease,
    };
  },
}));

import { getLatestTag } from "../../../src/modules/update/util/get-latest-tag.ts";

describe("getLatestTag", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the latest alpha prerelease", async () => {
    mocks.listReleases.mockResolvedValue({
      data: [
        { prerelease: false, tag_name: "v1.0.0" },
        { prerelease: true, tag_name: "v2.0.0-alpha.1" },
      ],
    });

    await expect(getLatestTag("alpha")).resolves.toBe("v2.0.0-alpha.1");
  });

  it("throws when no alpha release exists", async () => {
    mocks.listReleases.mockResolvedValue({
      data: [{ prerelease: false, tag_name: "v1.0.0" }],
    });

    await expect(getLatestTag("alpha")).rejects.toThrow(
      "no alpha release found",
    );
  });

  it("returns the latest stable release", async () => {
    mocks.getLatestRelease.mockResolvedValue({
      data: { tag_name: "v3.0.0" },
    });

    await expect(getLatestTag("stable")).resolves.toBe("v3.0.0");
  });
});
