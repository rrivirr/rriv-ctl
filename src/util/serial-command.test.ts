import serialCommands from "./serial-commands.ts";

describe("serial-command", () => {
  it("quietModeCommand", () => {
    expect(serialCommands.quietModeCommand).toEqual(
      `{"object":"datalogger", "action":"set_mode", "mode":"quiet"}\n`
    );
  });
});
