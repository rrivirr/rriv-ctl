import { describe, expect, it } from "vitest";
import { getSerialPathFromCache } from "../../src/util/get-serial-path-from-cache.ts";
import { seedUser } from "../helpers/db.ts";

describe("getSerialPathFromCache", () => {
  it("returns the active user's cached serial path", () => {
    seedUser({ serialPortPath: "/dev/ttyUSB9" });
    expect(getSerialPathFromCache()).toBe("/dev/ttyUSB9");
  });
});
