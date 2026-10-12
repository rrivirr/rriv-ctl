import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getContexts: vi.fn(),
  getContextByName: vi.fn(),
}));

vi.mock("../../../src/api/context.ts", () => ({
  getContexts: mocks.getContexts,
  getContextByName: mocks.getContextByName,
}));

import {
  listContexts,
  useContext,
} from "../../../src/modules/context/context.service.ts";
import { getActiveUser } from "../../../src/util/get-logged-in-user.ts";
import { seedUser } from "../../helpers/db.ts";

describe("listContexts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("prints a table for the user's contexts", async () => {
    seedUser({ context: { id: "c1", name: "well" } });
    mocks.getContexts.mockResolvedValue([
      {
        id: "c1",
        name: "well",
        startedAt: "2026-01-01T00:00:00.000Z",
        endedAt: null,
        Account: { email: "a@b.c" },
      },
    ]);

    await listContexts({});

    expect(console.log).toHaveBeenCalled();
  });

  it("reports when no contexts are found", async () => {
    seedUser();
    mocks.getContexts.mockResolvedValue([]);

    await listContexts({ search: "nope" });

    expect(console.log).toHaveBeenCalledWith(
      "no contexts found with given parameters",
    );
  });
});

describe("useContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("stores the selected context", async () => {
    seedUser();
    mocks.getContextByName.mockResolvedValue({
      id: "c9",
      name: "river",
      endedAt: null,
    });

    await useContext("river");

    expect(getActiveUser().context).toEqual({ id: "c9", name: "river" });
  });

  it("rejects an ended context", async () => {
    seedUser();
    mocks.getContextByName.mockResolvedValue({
      id: "c9",
      name: "river",
      endedAt: "2026-01-01T00:00:00.000Z",
    });

    await expect(useContext("river")).rejects.toThrow(
      "context specified has already ended",
    );
  });

  it("rejects an unknown context", async () => {
    seedUser();
    mocks.getContextByName.mockResolvedValue(undefined);

    await expect(useContext("nope")).rejects.toThrow(
      "context specified does not exist",
    );
  });
});
