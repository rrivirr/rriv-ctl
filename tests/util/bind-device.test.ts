import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ bindDevice: vi.fn() }));
vi.mock("../../src/api/device.ts", () => ({ bindDevice: mocks.bindDevice }));

import { bindDevice } from "../../src/util/bind-device.ts";

describe("bindDevice", () => {
  it("binds then waits for the auth sync window", async () => {
    vi.useFakeTimers();
    mocks.bindDevice.mockResolvedValue({ id: "d1" });

    const promise = bindDevice({ serialNumber: "00001" });
    await vi.advanceTimersByTimeAsync(3000);

    await expect(promise).resolves.toEqual({ id: "d1" });
    expect(mocks.bindDevice).toHaveBeenCalledWith({ serialNumber: "00001" });
    vi.useRealTimers();
  });
});
