import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  select: vi.fn(),
  getDeviceDetails: vi.fn(),
}));

vi.mock("serialport", () => ({
  SerialPort: { list: mocks.list },
}));
vi.mock("@inquirer/prompts", () => ({ select: mocks.select }));
vi.mock("../../src/util/get-device-details.ts", () => ({
  getDeviceDetails: mocks.getDeviceDetails,
}));

import { getConnectedDevice } from "../../src/util/get-connected-device.ts";
import { seedUser } from "../helpers/db.ts";

const rrivDevice = (path: string) => ({
  manufacturer: "RRIV",
  path,
  serialNumber: path,
});

describe("getConnectedDevice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    seedUser();
    mocks.getDeviceDetails.mockResolvedValue({
      serialNumber: "00001",
      uid: "u1",
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("detects a single device", async () => {
    mocks.list.mockResolvedValue([rrivDevice("/dev/tty1")]);
    await expect(getConnectedDevice({})).resolves.toEqual({
      serialPortPath: "/dev/tty1",
      serialNumber: "00001",
      uid: "u1",
    });
  });

  it("returns just the path when asked", async () => {
    mocks.list.mockResolvedValue([rrivDevice("/dev/tty1")]);
    await expect(getConnectedDevice({ getPath: true })).resolves.toEqual({
      serialPortPath: "/dev/tty1",
    });
    expect(mocks.getDeviceDetails).not.toHaveBeenCalled();
  });

  it("prompts when multiple devices are attached", async () => {
    mocks.list.mockResolvedValue([
      rrivDevice("/dev/tty1"),
      rrivDevice("/dev/tty2"),
    ]);
    mocks.select.mockResolvedValue("/dev/tty2");

    await expect(getConnectedDevice({})).resolves.toMatchObject({
      serialPortPath: "/dev/tty2",
    });
    expect(mocks.select).toHaveBeenCalledTimes(1);
  });

  it("throws after waiting when no device is found", async () => {
    vi.useFakeTimers();
    mocks.list.mockResolvedValue([]);

    const promise = getConnectedDevice({});
    const assertion = expect(promise).rejects.toThrow(
      "No RRIV device found connected",
    );
    await vi.advanceTimersByTimeAsync(50 * 500);
    await assertion;
  });

  it("returns undefined when provisioning without a device", async () => {
    vi.useFakeTimers();
    mocks.list.mockResolvedValue([]);

    const promise = getConnectedDevice({ provisionCommand: true });
    await vi.advanceTimersByTimeAsync(50 * 500);
    await expect(promise).resolves.toBeUndefined();
  });

  it("uses an explicitly specified path", async () => {
    await expect(
      getConnectedDevice({ specifiedSerialPortPath: "/dev/ttyX" }),
    ).resolves.toMatchObject({ serialPortPath: "/dev/ttyX" });
    expect(mocks.list).not.toHaveBeenCalled();
  });

  it("rejects an unprovisioned device unless provisioning", async () => {
    mocks.list.mockResolvedValue([rrivDevice("/dev/tty1")]);
    mocks.getDeviceDetails.mockResolvedValue({
      serialNumber: "*1234",
      uid: "u1",
    });

    await expect(getConnectedDevice({})).rejects.toThrow("not yet provisioned");
    await expect(
      getConnectedDevice({ provisionCommand: true }),
    ).resolves.toMatchObject({ serialNumber: "*1234" });
  });

  it("rejects provisioning an already-provisioned device", async () => {
    mocks.list.mockResolvedValue([rrivDevice("/dev/tty1")]);
    await expect(
      getConnectedDevice({ provisionCommand: true }),
    ).rejects.toThrow("device already provisioned");
  });
});
