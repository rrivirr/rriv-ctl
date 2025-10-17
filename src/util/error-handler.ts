import { CommanderError } from "commander";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorHandler = (body: { error: any; exit: boolean }) => {
  const { error, exit } = body;
  const errorResponse = error?.response?.data;
  if (errorResponse) {
    const errorMessage =
      `ApiError: ` +
      (errorResponse?.error_description ||
        errorResponse.message ||
        errorResponse);

    if (errorMessage === "ApiError: uniquename of device is required") {
      console.log("unique name flag is required");
    } else {
      console.log(errorMessage);
    }
  } else if (error instanceof CommanderError || error?.message === "exit") {
    // do nothing
  } else if (error.message === "(outputHelp)") {
    if (exit) {
      process.exit(0);
    }
  } else if (error.errors) {
    console.log(`${error.errors}`);
  } else {
    console.log(`\nError`, error?.message || error);
  }
  if (exit) {
    process.exit(0);
  }
};
