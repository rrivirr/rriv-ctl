import os from "os";
import { getRRIVDir, getRrivCtlDir, defaultSerialFile } from "./paths.ts";

describe("paths", () => {
  const homedirSpy = jest.spyOn(os, "homedir");

  beforeEach(() => {
    homedirSpy.mockReturnValue("/dresscode/silk");
  });

  it("getRRIVDir", () => {
    const path = getRRIVDir();
    expect(path).toEqual("/dresscode/silk/.rriv");
  });

  it("getRrivCtlDir", () => {
    const path = getRrivCtlDir();
    expect(path).toEqual("/dresscode/silk/.rriv/.rrivctl");
  });

  it("defaultSerialFile", () => {
    const path = defaultSerialFile();
    expect(path).toEqual("/dresscode/silk/.rriv/.rrivctl/default_serial");
  });
});
