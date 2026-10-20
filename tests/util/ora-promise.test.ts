import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ oraPromise: vi.fn() }));
vi.mock("ora", () => ({ oraPromise: mocks.oraPromise }));

import db from "../../src/db/db.ts";
import { oraPromise } from "../../src/util/ora-promise.ts";

describe("oraPromise", () => {
  it("runs the task with the configured spinner", async () => {
    db.update((data) => {
      data.spinner = "dots";
    });
    mocks.oraPromise.mockResolvedValue("done");
    const task = async () => "done";

    await expect(oraPromise(task)).resolves.toBe("done");

    expect(mocks.oraPromise).toHaveBeenCalledWith(
      task,
      expect.objectContaining({ spinner: "dots" }),
    );
  });

  it("falls back to a default spinner", async () => {
    db.update((data) => {
      data.spinner = "";
    });
    mocks.oraPromise.mockResolvedValue("done");

    await oraPromise(async () => "done");

    expect(mocks.oraPromise).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ spinner: "simpleDots" }),
    );
  });
});
