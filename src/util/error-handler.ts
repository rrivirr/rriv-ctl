import { CommanderError } from "commander";
import { logAsDebug } from "./debug-logger.ts";
import { italic } from "yoctocolors";
import * as Sentry from "@sentry/node";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorHandler = async (body: { error: any; exit: boolean }) => {
  const { error, exit } = body;
  Sentry.captureException(error);
  await Sentry.flush();

  logAsDebug(error);
  const errorResponse = error?.response?.data;
  if (errorResponse) {
    const errorMessage =
      `ApiError: ` +
      (errorResponse?.error_description ||
        errorResponse.message ||
        JSON.stringify(errorResponse));

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
    if (
      error?.message?.includes("path") &&
      error?.message?.includes(`is not defined`)
    ) {
      console.log(`device path not found; run ${italic("rrivctlv2 connect")}`);
    } else {
      console.log(`\nError`, error?.message || error);
    }
  }
  if (exit) {
    process.exit(0);
  }
};
