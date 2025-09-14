import { errorHandler } from "./error-handler.ts";

describe("error-handler", () => {
  const consoleLogSpy = jest.spyOn(console, "log");
  const processExitSpy = jest.spyOn(process, "exit");

  beforeEach(() => {
    processExitSpy.mockImplementation(() => {
      throw new Error("EXIT");
    });
  });

  describe("errorResponse", () => {
    it("error_description", () => {
      expect(() =>
        errorHandler({
          exit: true,
          error: {
            response: {
              data: { error_description: "description of said error" },
            },
          },
        })
      ).toThrow("EXIT");

      expect(processExitSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `\nApiError:`,
        "description of said error"
      );
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it("message", () => {
      errorHandler({
        exit: false,
        error: {
          response: { data: { message: "message of said error" } },
        },
      });

      expect(processExitSpy).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `\nApiError:`,
        "message of said error"
      );
    });

    it("errorResponse", () => {
      const errorResponse = { custom: "not directly supported" };
      errorHandler({
        exit: false,
        error: {
          response: { data: errorResponse },
        },
      });

      expect(processExitSpy).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(`\nApiError:`, errorResponse);
    });
  });

  it("(outputHelp); exit true", () => {
    expect(() =>
      errorHandler({
        exit: true,
        error: { message: "(outputHelp)" }, // weird commander error
      })
    ).toThrow("EXIT");

    expect(processExitSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(processExitSpy).toHaveBeenCalledWith(0);
  });

  it("(outputHelp): exit: false", () => {
    errorHandler({
      exit: false,
      error: { message: "(outputHelp)" }, // weird commander error
    });

    expect(processExitSpy).not.toHaveBeenCalled();
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it("error.errors: exit: false", () => {
    errorHandler({
      exit: false,
      error: { errors: ["error!!"] },
    });

    expect(processExitSpy).not.toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(`${["error!!"]}`);
  });

  it("error.errors: exit: true", () => {
    expect(() =>
      errorHandler({
        exit: true,
        error: { errors: ["error!!"] },
      })
    ).toThrow("EXIT");

    expect(processExitSpy).toHaveBeenCalledTimes(1);
    expect(processExitSpy).toHaveBeenCalledWith(0);
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(`${["error!!"]}`);
  });

  it("unsupported error: message property; exit true", () => {
    expect(() =>
      errorHandler({
        exit: true,
        error: { message: "no error found" },
      })
    ).toThrow("EXIT");

    expect(processExitSpy).toHaveBeenCalledTimes(1);
    expect(processExitSpy).toHaveBeenCalledWith(0);
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(`\nError`, `no error found`);
  });

  it("unsupported error: unknown property; exit false", () => {
    errorHandler({
      exit: false,
      error: { customPaint: "no error found" },
    });

    expect(processExitSpy).not.toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(`\nError`, {
      customPaint: "no error found",
    });
  });
});
