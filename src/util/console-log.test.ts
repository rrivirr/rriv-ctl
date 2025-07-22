import { randomUUID } from "crypto";
import db from "../db/db.ts";
import { logToConsole, pronounce } from "./console-log.ts";

describe("Console-log", () => {
  it("pronounce", () => {
    const pronounced = pronounce("still freezing");
    expect(pronounced).toEqual("underline-cyan-bold-still freezing");
  });

  it("logToConsole", () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

    const contextName = randomUUID();
    const assignedDeviceName = randomUUID();
    const phrase = randomUUID();
    db.update((data) => {
      data.context.name = contextName;
      data.deviceContext.assignedDeviceName = assignedDeviceName;
    });

    logToConsole(phrase);

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `underline-cyan-bold-${contextName}:${assignedDeviceName}`,
      "=>",
      phrase
    );
  });
});
