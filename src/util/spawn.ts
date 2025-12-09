import ChildProcess from "child_process";

export const spawn = (
  cmd: string,
  args: string[],
  errorCleanUp?: () => Promise<void>
) =>
  new Promise<void>((resolve, reject) => {
    const stdout = ChildProcess.spawn(cmd, args, {
      stdio: "inherit",
    });

    stdout.on("error", (error) => {
      reject(error);
    });

    stdout.on("close", async (exitCode) => {
      if (exitCode !== 0) {
        if (errorCleanUp) {
          await errorCleanUp();
        }
        return reject({ message: "exit" });
      }
      resolve();
    });
  });
