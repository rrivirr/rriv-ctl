import ChildProcess from "child_process";
import { errorHandler } from "./error-handler.ts";

export const spawn = (cmd: string, args: string[]) =>
  new Promise<void>((resolve, reject) => {
    const stdout = ChildProcess.spawn(cmd, args, {
      stdio: "inherit",
    });

    stdout.on("error", (error) => {
      reject(error);
    });

    stdout.on("close", (exitCode) => {
      if (exitCode !== 0) {
        errorHandler({ error: { message: "exit" }, exit: true });
      }
      resolve();
    });
  });
