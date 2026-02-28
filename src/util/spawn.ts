import ChildProcess from "child_process";
import { logAsDebug } from "./debug-logger.ts";

export const spawn = (
  cmd: string,
  args: string[],
  errorCleanUp?: (() => Promise<void>) | (() => Promise<boolean | undefined>),
) =>
  new Promise<void>((resolve, reject) => {
    const stdout = ChildProcess.spawn(cmd, args, {
      stdio: "inherit",
    });

    // ensure cleanup function runs if user cancels
    process.on("SIGINT", () => {
      stdout.kill();
    });

    stdout.on("error", (error) => {
      reject(error);
    });

    stdout.on("close", async (exitCode, signal) => {
      logAsDebug("script exitCode:signal", exitCode, ":", signal);
      if (exitCode !== 0) {
        if (errorCleanUp) {
          const toResolve = await errorCleanUp();
          if (toResolve) {
            return resolve();
          }
        }
        return reject({ message: "exit" });
      }
      resolve();
    });
  });
