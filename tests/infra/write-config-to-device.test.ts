import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ sendCommands: vi.fn() }));
vi.mock("../../src/infra/send-commands.ts", () => ({
  sendCommands: mocks.sendCommands,
}));

import { writeConfigToDevice } from "../../src/infra/write-config-to-device.ts";

describe("writeConfigToDevice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends the payload with action=set and returns the applied config", async () => {
    mocks.sendCommands.mockResolvedValue([{ applied: true }]);

    const result = await writeConfigToDevice({ object: "device", id: "d1" });

    expect(result).toEqual({ applied: true });
    expect(mocks.sendCommands).toHaveBeenCalledWith(
      [JSON.stringify({ object: "device", id: "d1", action: "set" })],
      false,
    );
  });
});
