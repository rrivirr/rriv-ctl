import { input } from "@inquirer/prompts";
import { bindDevicePrompt } from "./device.prompt.ts";
import { randomUUID } from "crypto";

jest.mock("@inquirer/prompts");

describe("devicePrompt", () => {
  it("bindDevicePrompt", async () => {
    const uniqueName = randomUUID();
    const inputMock = input as jest.MockedFunction<typeof input>;
    inputMock.mockResolvedValue(uniqueName);

    const result = await bindDevicePrompt();
    expect(result).toEqual({ uniqueName });
    expect(inputMock).toHaveBeenCalledTimes(1);

    const inputMockArgs = inputMock.mock.calls[0][0];
    expect(inputMockArgs.message).toEqual(
      "Enter a unique name for this device"
    );
    expect(Object.keys(inputMockArgs).length).toEqual(2);

    const inputMockValidationFunction = inputMockArgs.validate!;
    const inputValidationResult1 = inputMockValidationFunction("na");
    expect(inputValidationResult1).toEqual(
      "value must have at least 3 letters"
    );
    const inputValidationResult2 = inputMockValidationFunction(`uniqueName`);
    expect(inputValidationResult2).toEqual(true);
  });
});
