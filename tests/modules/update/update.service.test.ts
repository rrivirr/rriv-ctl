import { beforeEach, describe, expect, it, vi } from "vitest";
import packageJson from "../../../package.json" with { type: "json" };

const mocks = vi.hoisted(() => ({
  getLatestTag: vi.fn(),
  spawn: vi.fn(),
  loadScript: vi.fn(),
  confirm: vi.fn(),
  errorHandler: vi.fn(),
}));

vi.mock("../../../src/modules/update/util/get-latest-tag.ts", () => ({
  getLatestTag: mocks.getLatestTag,
}));
vi.mock("../../../src/util/spawn.ts", () => ({ spawn: mocks.spawn }));
vi.mock("../../../src/util/load-script.ts", () => ({
  loadScript: mocks.loadScript,
}));
vi.mock("@inquirer/prompts", () => ({ confirm: mocks.confirm }));
vi.mock("../../../src/util/error-handler.ts", () => ({
  errorHandler: mocks.errorHandler,
}));

import db from "../../../src/db/db.ts";
import {
  checkVersionAndUpdate,
  updateRrivctl,
} from "../../../src/modules/update/update.service.ts";

const currentTag = `v${packageJson.version}`;

const reset = () => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  db.update((data) => {
    data.updateChannel = "stable";
    // Slightly in the past: a 0ms diff is treated as "never checked" by the
    // service, which made the "skips within a day" test flaky.
    data.lastVersionCheckAt = new Date(Date.now() - 1_000);
  });
  mocks.loadScript.mockResolvedValue("/scripts/update.sh");
  mocks.spawn.mockResolvedValue(undefined);
};

describe("updateRrivctl", () => {
  beforeEach(reset);

  it("only changes the channel when no tag is given", async () => {
    await updateRrivctl(undefined, "alpha");
    expect(db.data.updateChannel).toBe("alpha");
    expect(mocks.spawn).not.toHaveBeenCalled();
  });

  it("rejects a tag outside the current channel", async () => {
    await expect(updateRrivctl("v9.9.9-alpha.1")).rejects.toThrow(
      "Tag specified not in update channel",
    );
  });

  it("short-circuits when already on the requested tag", async () => {
    await updateRrivctl(currentTag);
    expect(mocks.spawn).not.toHaveBeenCalled();
  });

  it("spawns the updater for a tag in the right channel", async () => {
    db.update((data) => {
      data.updateChannel = "alpha";
    });
    await updateRrivctl("v9.9.9-alpha.1");
    expect(mocks.spawn).toHaveBeenCalledWith("bash", [
      "/scripts/update.sh",
      "v9.9.9-alpha.1",
    ]);
  });

  it("updates to the latest alpha when on the alpha channel", async () => {
    db.update((data) => {
      data.updateChannel = "alpha";
    });
    mocks.getLatestTag.mockResolvedValue("v9.9.9-alpha.2");
    await updateRrivctl();
    expect(mocks.getLatestTag).toHaveBeenCalledWith("alpha");
    expect(mocks.spawn).toHaveBeenCalledWith("bash", [
      "/scripts/update.sh",
      "v9.9.9-alpha.2",
    ]);
  });

  it("short-circuits when already on the latest alpha", async () => {
    db.update((data) => {
      data.updateChannel = "alpha";
    });
    mocks.getLatestTag.mockResolvedValue(currentTag);
    await updateRrivctl();
    expect(mocks.spawn).not.toHaveBeenCalled();
  });

  it("updates from the stable channel", async () => {
    mocks.getLatestTag.mockResolvedValue("v9.9.9");
    await updateRrivctl();
    expect(mocks.getLatestTag).toHaveBeenCalledWith("stable");
    expect(mocks.spawn).toHaveBeenCalledWith("bash", ["/scripts/update.sh"]);
  });

  it("defaults the channel to stable when unset", async () => {
    db.update((data) => {
      data.updateChannel = "" as never;
    });
    mocks.getLatestTag.mockResolvedValue("v9.9.9");
    await updateRrivctl();
    expect(db.data.updateChannel).toBe("stable");
  });
});

describe("checkVersionAndUpdate", () => {
  beforeEach(reset);

  it("skips the check when it ran within the last day", async () => {
    await checkVersionAndUpdate();
    expect(mocks.getLatestTag).not.toHaveBeenCalled();
  });

  it("prompts and updates when a newer version is available", async () => {
    db.update((data) => {
      data.lastVersionCheckAt = new Date(Date.now() - 2 * 86_400_000);
    });
    mocks.getLatestTag.mockResolvedValue("v9.9.9");
    mocks.confirm.mockResolvedValue(true);

    await checkVersionAndUpdate();

    expect(mocks.confirm).toHaveBeenCalled();
    expect(mocks.spawn).toHaveBeenCalled();
  });

  it("does not update when the prompt is declined", async () => {
    db.update((data) => {
      data.lastVersionCheckAt = new Date(Date.now() - 2 * 86_400_000);
    });
    mocks.getLatestTag.mockResolvedValue("v9.9.9");
    mocks.confirm.mockResolvedValue(false);

    await checkVersionAndUpdate();

    expect(mocks.spawn).not.toHaveBeenCalled();
  });

  it("reports when the version check fails", async () => {
    db.update((data) => {
      data.lastVersionCheckAt = new Date(Date.now() - 2 * 86_400_000);
    });
    mocks.getLatestTag.mockRejectedValue(new Error("offline"));

    await checkVersionAndUpdate();

    expect(mocks.errorHandler).toHaveBeenCalledTimes(1);
  });
});
