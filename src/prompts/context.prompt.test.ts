import { input, rawlist, confirm } from "@inquirer/prompts";
import {
  contextPrompt,
  selectContextPrompt,
  confirmContextPrompt,
} from "./context.prompt.ts";

jest.mock("@inquirer/prompts");

describe("contextPrompt", () => {
  const consoleLogSpy = jest.spyOn(console, "log");

  beforeEach(() => {
    consoleLogSpy.mockImplementation();
  });

  it("contextPrompt", async () => {
    const context = "fieldContext";
    const inputMock = input as jest.MockedFunction<typeof input>;
    inputMock.mockResolvedValue(context);

    const result = await contextPrompt();

    expect(result).toEqual({ contextName: "fieldContext" });
    expect(inputMock).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith("create new context...\n");

    const inputMockArgs = inputMock.mock.calls[0][0];
    expect(inputMockArgs.message).toEqual("name of context");
    expect(Object.keys(inputMockArgs).length).toEqual(2);

    const inputMockValidationFunction = inputMockArgs.validate!;
    const inputValidationResult1 = inputMockValidationFunction("co");
    expect(inputValidationResult1).toEqual(
      "value must have at least 3 letters"
    );
    const inputValidationResult2 = inputMockValidationFunction(`context`);
    expect(inputValidationResult2).toEqual(true);
  });

  it("selectContextPrompt", async () => {
    const rawlistMock = rawlist as jest.MockedFunction<typeof rawlist>;
    rawlistMock.mockResolvedValue("choice1");

    const result = await selectContextPrompt(["choice1", "choice2", "choice3"]);

    expect(result).toEqual({ contextName: "choice1" });
    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(rawlistMock).toHaveBeenCalledTimes(1);
    expect(rawlistMock).toHaveBeenCalledWith({
      message: "Select a context to work in",
      choices: [
        { name: "choice1", value: "choice1" },
        { name: "choice2", value: "choice2" },
        { name: "choice3", value: "choice3" },
      ],
    });
  });

  it("confirmContextPrompt", async () => {
    const confirmMock = confirm as jest.MockedFunction<typeof confirm>;
    confirmMock.mockResolvedValue(false);

    const result = await confirmContextPrompt("labContext");
    expect(result).toEqual(false);
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith("Existing context found...");
    expect(confirmMock).toHaveBeenCalledTimes(1);
    expect(confirmMock).toHaveBeenCalledWith({
      message: `Continue with labContext?`,
    });
  });
});
