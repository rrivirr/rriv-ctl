import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createDeviceContext: vi.fn() }));
vi.mock("../../../src/api/device-context.ts", () => ({
  createDeviceContext: mocks.createDeviceContext,
}));

import { createDeviceContext } from "../../../src/modules/context/device-context.service.ts";

describe("createDeviceContext", () => {
  it("forwards the payload to the API", async () => {
    await createDeviceContext({
      contextId: "c1",
      deviceId: "d1",
      assignedDeviceName: "well",
    });
    expect(mocks.createDeviceContext).toHaveBeenCalledWith({
      contextId: "c1",
      deviceId: "d1",
      assignedDeviceName: "well",
    });
  });
});
