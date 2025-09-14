import { input, password } from "@inquirer/prompts";
import { authPrompt } from "./auth.prompt.ts";
import { randomUUID } from "crypto";

jest.mock("@inquirer/prompts");

describe("authPrompt", () => {
  it("authPrompt", async () => {
    const email = randomUUID();
    const passwordValue = randomUUID();
    const inputMock = input as jest.MockedFunction<typeof input>;
    const passwordMock = password as jest.MockedFunction<typeof password>;

    inputMock.mockResolvedValue(email);
    passwordMock.mockResolvedValue(passwordValue);

    const result = await authPrompt();

    expect(result).toEqual({ email, password: passwordValue });
    expect(inputMock).toHaveBeenCalledTimes(1);
    expect(passwordMock).toHaveBeenCalledTimes(1);

    const inputMockArgs = inputMock.mock.calls[0][0];
    const passwordMockArgs = passwordMock.mock.calls[0][0];

    expect(inputMockArgs.message).toEqual("email");
    expect(Object.keys(inputMockArgs).length).toEqual(2);
    expect(passwordMockArgs.message).toEqual("password");
    expect(passwordMockArgs.mask).toEqual(true);
    expect(Object.keys(passwordMockArgs).length).toEqual(3);

    const inputMockValidationFunction = inputMockArgs.validate!;
    const inputValidationResult1 = inputMockValidationFunction("");
    expect(inputValidationResult1).toEqual(false);
    const inputValidationResult2 = inputMockValidationFunction(`user's name`);
    expect(inputValidationResult2).toEqual(true);

    const passwordMockValidationFunction = passwordMockArgs.validate!;
    const passwordValidationResult1 = passwordMockValidationFunction("");
    expect(passwordValidationResult1).toEqual(false);
    const passwordValidationResult2 =
      passwordMockValidationFunction(`user's password`);
    expect(passwordValidationResult2).toEqual(true);
  });
});
