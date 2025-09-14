import { randomUUID } from "crypto";
import db from "../db/db.ts";
import { getSerialPathFromCache } from "./get-serial-path-from-cache.ts";

describe("getSerialPathFromCache", () => {
  it("getSerialPathFromCache", () => {
    const serialPathMockData = randomUUID();
    db.update((data) => {
      data.device.serialPortPath = serialPathMockData;
    });
    const serialPath = getSerialPathFromCache();
    expect(serialPath).toEqual(serialPathMockData);
  });
});
