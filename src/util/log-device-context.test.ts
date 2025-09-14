import Table from "cli-table3";
import { randomUUID } from "crypto";
import db from "../db/db.ts";
import { logDeviceContext } from "./log-device-context.ts";

jest.mock("cli-table3");

describe("logDeviceContext", () => {
  const consoleLogSpy = jest.spyOn(console, "log");
  it("logDeviceContext", () => {
    const uniqueName = randomUUID();
    const contextName = randomUUID();
    const assignedDeviceName = randomUUID();

    db.update((data) => {
      data.device.uniqueName = uniqueName;
      data.context.name = contextName;
      data.deviceContext.assignedDeviceName = assignedDeviceName;
    });

    logDeviceContext();

    expect(Table).toHaveBeenCalledWith({
      head: [
        "name of context",
        `device's unique name`,
        `device's assigned name in context`,
      ],
    });

    const mockTableInstance = (Table as jest.MockedClass<Table>).mock
      .instances[0];
    const mockPush = mockTableInstance.push;
    const mockToString = mockTableInstance.toString;
    expect(mockPush).toHaveBeenNthCalledWith(1, [
      contextName,
      uniqueName,
      assignedDeviceName,
    ]);
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockToString).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(undefined);
  });
});
