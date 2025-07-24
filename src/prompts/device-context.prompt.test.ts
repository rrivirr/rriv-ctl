import { input } from "@inquirer/prompts";
import { assignedDeviceNamePrompt } from "./device-context.prompt.ts";
import { randomUUID } from "crypto";

jest.mock("@inquirer/prompts");

describe("deviceContextPrompt", () => {
  it("assignedDeviceNamePrompt", async () => {
    const assignedDeviceName = randomUUID();
    const inputMock = input as jest.MockedFunction<typeof input>;
    inputMock.mockResolvedValue(assignedDeviceName);

    const result = await assignedDeviceNamePrompt();
    expect(result).toEqual({ assignedDeviceName });
    expect(inputMock).toHaveBeenCalledTimes(1);

    const inputMockArgs = inputMock.mock.calls[0][0];
    expect(inputMockArgs.message).toEqual(
      "Assign a name for this device in the current context:"
    );
    expect(Object.keys(inputMockArgs).length).toEqual(2);

    const inputMockValidationFunction = inputMockArgs.validate!;
    const inputValidationResult1 = inputMockValidationFunction("na");
    expect(inputValidationResult1).toEqual(
      "value must have at least 3 letters"
    );
    const inputValidationResult2 = inputMockValidationFunction(`deviceName`);
    expect(inputValidationResult2).toEqual(true);
  });
});
