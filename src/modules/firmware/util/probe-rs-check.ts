import ChildProcess from "child_process";
import util from "util";

export const probeRsCheck = async () => {
  const exec = util.promisify(ChildProcess.exec);
  try {
    await exec("probe-rs -V");
    return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error?.stderr?.includes("not found")) {
      console.log("probe-rs not found, installing probe-rs");
      await exec(
        `curl --proto '=https' --tlsv1.2 -LsSf https://github.com/probe-rs/probe-rs/releases/latest/download/probe-rs-tools-installer.sh | sh`
      );
      console.log("probe-rs successfully installed");
      return;
    } else {
      throw error;
    }
  }
};
