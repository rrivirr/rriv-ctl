import { selectDriverPrompt } from "./driver.prompt.ts";
import { rawlist } from "@inquirer/prompts";

jest.mock("@inquirer/prompts");
describe("driverPrompt", () => {
  it("driverPrompt", async () => {
    const rawlistMock = rawlist as jest.MockedFunction<typeof rawlist>;
    rawlistMock.mockResolvedValue("driver3");

    const result = await selectDriverPrompt(["driver1", "driver2", "driver3"]);

    expect(result).toEqual({ driverName: "driver3" });
    expect(rawlistMock).toHaveBeenCalledTimes(1);
    expect(rawlistMock).toHaveBeenCalledWith({
      message: "Select a driver for this config",
      choices: [
        { name: "driver1", value: "driver1" },
        { name: "driver2", value: "driver2" },
        { name: "driver3", value: "driver3" },
      ],
    });
  });
});
