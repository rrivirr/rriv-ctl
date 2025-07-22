import Table from "cli-table3";
import { randomUUID } from "crypto";
import { logConfigLibrary } from "./log-config-library.ts";

jest.mock("cli-table3");

describe("logConfigLibrary", () => {
  const consoleLogSpy = jest.spyOn(console, "log");
  it("logConfigLibrary", () => {
    const config1 = {
      id: randomUUID(),
      name: "sensor config",
      createdAt: new Date().toISOString(),
      description: "I do it",
      Creator: { firstName: "Uchiha", lastName: "itachi" },
    };
    const config2 = {
      id: randomUUID(),
      name: "data config",
      createdAt: new Date().toISOString(),
      description: "esco season",
      Creator: { firstName: "Nasir", lastName: "Jones" },
    };
    logConfigLibrary([config1, config2]);

    expect(Table).toHaveBeenCalledWith({
      head: ["id", "name", "description", "created at", "creator"],
      wordWrap: true,
      wrapOnWordBoundary: false,
    });

    const mockTableInstance = (Table as jest.MockedClass<Table>).mock
      .instances[0];
    const mockPush = mockTableInstance.push;
    const mockToString = mockTableInstance.toString;
    expect(mockPush).toHaveBeenNthCalledWith(1, [
      config1.id,
      config1.name,
      config1.description,
      config1.createdAt,
      `${config1.Creator.firstName} ${config1.Creator.lastName}`,
    ]);
    expect(mockPush).toHaveBeenNthCalledWith(2, [
      config2.id,
      config2.name,
      config2.description,
      config2.createdAt,
      `${config2.Creator.firstName} ${config2.Creator.lastName}`,
    ]);
    expect(mockPush).toHaveBeenCalledTimes(2);
    expect(mockToString).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(undefined);
  });
});
