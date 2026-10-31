import { describe, expect, it } from "vitest";
import { pronounce } from "../../src/util/console-log.ts";

describe("pronounce", () => {
  it("keeps the phrase text", () => {
    expect(pronounce("hello")).toContain("hello");
  });
});
