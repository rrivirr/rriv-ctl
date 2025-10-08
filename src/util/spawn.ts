import ChildProcess from "child_process";

export const spawn = (cmd: string, args: string[]) =>
  new Promise<void>((resolve, reject) => {
    const stdout = ChildProcess.spawn(cmd, args, {
      stdio: "inherit",
    });

    stdout.on("error", (error) => {
      reject(error);
    });

    stdout.on("close", () => {
      resolve();
    });
  });
