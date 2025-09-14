import { pronounce } from "./console-log.ts";

describe("Console-log", () => {
  it("pronounce", () => {
    const pronounced = pronounce("still freezing");
    expect(pronounced).toEqual("underline-cyan-bold-still freezing");
  });
});
