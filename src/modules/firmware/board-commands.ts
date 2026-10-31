import { ReadlineParser, SerialPort } from "serialport";
import { getMe } from "../../api/account.ts";
import { sendSingleCommand } from "../../infra/send-commands.ts";
import { DefaultObject } from "../../types.ts";
import { getSerialPathFromCache } from "../../util/get-serial-path-from-cache.ts";

/**
 * Firmware with a start-up log (rriv-firmware's `board get startup`) also has
 * `datalogger reset`, `device reset` and `board diagnostic`, which replace the
 * clear-EEPROM and diagnostic firmwares from rriv-scripts. Older firmware
 * panics on `datalogger reset` (a `todo!()` there), so it's never sent unless
 * the start-up log answered first.
 */

export interface StartupReport {
  previousCompleted: boolean;
  stoppedAt: string | null;
  failedStartups: number;
  resetCause: string;
  traced: boolean;
}

/** The `startup` object of a `board get startup` reply, or null (old firmware). */
export const parseStartupReport = (
  response: DefaultObject,
): StartupReport | null => {
  const report = response?.startup;
  if (!report || typeof report !== "object" || Array.isArray(report))
    return null;
  return {
    previousCompleted: report.previous_completed === true,
    stoppedAt: typeof report.stopped_at === "string" ? report.stopped_at : null,
    failedStartups: Number(report.failed_startups) || 0,
    resetCause:
      typeof report.reset_cause === "string" ? report.reset_cause : "unknown",
    traced: report.traced === true,
  };
};

/** A traced start-up's `{"startup":"<step>"}` / `{…,"done":true}` line, or null. */
export const parseTraceLine = (
  line: string,
): { step: string; done: boolean } | null => {
  try {
    const parsed = JSON.parse(line);
    if (typeof parsed?.startup !== "string") return null;
    return { step: parsed.startup, done: parsed.done === true };
  } catch {
    return null;
  }
};

export const describeStartupReport = (report: StartupReport) => {
  const lines = [
    `previous start-up: ${report.previousCompleted ? "finished" : "didn't finish"}`,
    `last reset: ${report.resetCause}`,
  ];
  if (!report.previousCompleted) {
    lines.push(`stopped at: ${report.stoppedAt ?? "unknown"}`);
    lines.push(
      `unfinished start-ups in a row before this one: ${report.failedStartups}`,
    );
  }
  if (report.traced) lines.push("this start-up was traced");
  return lines.join("\n");
};

const send = (
  command: object,
  serialPortPath = getSerialPathFromCache(),
  timeoutMs?: number,
) =>
  sendSingleCommand(
    JSON.stringify(command) + "\n",
    false,
    serialPortPath,
    timeoutMs,
  );

/** The resets write the EEPROM a byte at a time (about 5 s) before replying. */
const RESET_REPLY_MS = 15_000;

/** The board's start-up report, or null if its firmware doesn't keep one. */
export const readStartupReport = async (serialPortPath?: string) =>
  parseStartupReport(
    await send(
      { object: "board", action: "get", parameter: "startup" },
      serialPortPath,
    ),
  );

const failIfError = (reply: DefaultObject, what: string) => {
  if (reply?.error)
    throw new Error(`${what} failed: ${reply.message ?? reply.error}`);
};

/**
 * Open the board's port once it's back after a restart and hand every line to
 * `onLine` until it returns true, or `timeoutMs` passes.
 */
export const readAfterRestart = (
  serialPortPath: string,
  onLine: (line: string) => boolean,
  timeoutMs: number,
) =>
  new Promise<void>((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    let port: SerialPort | null = null;
    let finished = false;
    const finish = (error?: Error) => {
      if (finished) return;
      finished = true;
      port?.close(() => undefined);
      if (error) reject(error);
      else resolve();
    };
    const timer = setTimeout(
      () =>
        finish(
          new Error("Timed out waiting for the board to finish starting."),
        ),
      timeoutMs,
    );
    const tryOpen = () => {
      if (finished) return;
      if (Date.now() > deadline) return;
      const candidate = new SerialPort({
        path: serialPortPath,
        baudRate: 115200,
        autoOpen: false,
      });
      candidate.open((error) => {
        if (error) {
          // Still re-enumerating after the reset.
          setTimeout(tryOpen, 500);
          return;
        }
        port = candidate;
        const parser = candidate.pipe(new ReadlineParser({ delimiter: "\n" }));
        parser.on("data", (line: string) => {
          if (onLine(line.trim())) {
            clearTimeout(timer);
            finish();
          }
        });
        candidate.on("close", () => {
          // The board dropped off again (another reset); wait for it.
          port = null;
          if (!finished) setTimeout(tryOpen, 500);
        });
      });
    };
    // Give the board time to reset and drop off USB first.
    setTimeout(tryOpen, 1500);
  });

export const isReady = (line: string) => line.includes("datalogger-ready");

/** `datalogger reset`: default settings and no sensors; the serial number stays. */
export const resetDatalogger = async (
  serialPortPath = getSerialPathFromCache(),
) => {
  const reply = await send(
    { object: "datalogger", action: "reset" },
    serialPortPath,
    RESET_REPLY_MS,
  );
  failIfError(reply, "datalogger reset");
  await readAfterRestart(serialPortPath, isReady, 60_000);
};

/**
 * `board diagnostic`: restart with the start-up trace and print each step as
 * the board reports it over USB (the first few run before USB is up), then
 * the start-up report.
 */
export const traceStartup = async (
  serialPortPath = getSerialPathFromCache(),
) => {
  const reply = await send(
    { object: "board", action: "diagnostic" },
    serialPortPath,
  );
  failIfError(reply, "board diagnostic");
  console.log("restarting with the start-up trace (about a minute)...");
  await readAfterRestart(
    serialPortPath,
    (line) => {
      const trace = parseTraceLine(line);
      if (trace)
        console.log(
          trace.done ? `  ${trace.step} done` : `start-up: ${trace.step}`,
        );
      return isReady(line);
    },
    150_000,
  );
  const report = await readStartupReport(serialPortPath);
  if (report) console.log(describeStartupReport(report));
};

/**
 * `device reset`: blank serial number, default settings, no sensors.
 * Provisioners only. The device stays in rriv-api, bound as before, so
 * provisioning the board again gives back the same serial number.
 */
export const factoryReset = async (
  serialPortPath = getSerialPathFromCache(),
) => {
  const me = await getMe();
  if (!me.isProvisioner)
    throw new Error("Only provisioners can factory-reset a board.");
  const device = await send(
    { object: "device", action: "get" },
    serialPortPath,
  );
  const serialNumber =
    typeof device.serial_number === "string" ? device.serial_number : "";
  if (!/^[0-9A-Za-z]{5}$/.test(serialNumber)) {
    throw new Error(
      "The board has no serial number; there's nothing to factory-reset.",
    );
  }
  const reply = await send(
    { object: "device", action: "reset", serial_number: serialNumber },
    serialPortPath,
    RESET_REPLY_MS,
  );
  failIfError(reply, "device reset");
  await readAfterRestart(serialPortPath, isReady, 60_000);
  console.log(
    `board wiped; device ${serialNumber} is still in RRIV. Provision the board to give it back serial number ${serialNumber}.`,
  );
};
