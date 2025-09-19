import ChildProcess from "child_process";
import util from "util";
import { probeRsCheck } from "./util/probe-rs-check.ts";

export const probeDebug = async () => {
  await probeRsCheck();

  const exec = util.promisify(ChildProcess.exec);
  await exec(`probe-rs attach board/target/thumbv7m-none-eabi/debug/app \
        --chip STM32F103RE  \
        --protocol swd \
        --allow-erase-all \
        --chip-erase`);
};
