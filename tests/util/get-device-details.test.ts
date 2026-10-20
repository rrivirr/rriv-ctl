import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ sendCommands: vi.fn() }));
vi.mock("../../src/infra/send-commands.ts", () => ({
  sendCommands: mocks.sendCommands,
}));

import {
  getBoardVersion,
  getDeviceDetails,
} from "../../src/util/get-device-details.ts";

describe("getDeviceDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("returns the serial number and uid", async () => {
    mocks.sendCommands.mockResolvedValue([
      { serial_number: "00001", uid: "u1", codes: ["E1"] },
    ]);

    await expect(getDeviceDetails("/dev/tty")).resolves.toEqual({
      serialNumber: "00001",
      uid: "u1",
    });
  });

  it("returns the board firmware version", async () => {
    mocks.sendCommands.mockResolvedValue([
      { message: JSON.stringify({ fv: "1.2.3" }) },
    ]);

    await expect(getBoardVersion("/dev/tty")).resolves.toBe("1.2.3");
  });
});
