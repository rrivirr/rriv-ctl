import {
  describeStartupReport,
  factoryReset,
  readStartupReport,
  resetDatalogger,
  traceStartup,
} from "../../modules/firmware/board-commands.ts";
import { clearEeprom, flashFirmware } from "../../modules/firmware/flash.ts";
import { probeDebug } from "../../modules/firmware/probe-debug.ts";
import { runDiagnostics } from "../../modules/firmware/run-diagnostics.ts";
import { migrateFirmware } from "../../modules/firmware/migrate.ts";
import { updateFirmware } from "../../modules/firmware/usb-update.ts";
import { uploadFirmwareEntry } from "../../modules/firmware/util/upload-firmware-entry.ts";
import { getSerialPathFromCache } from "../../util/get-serial-path-from-cache.ts";
import fs from "node:fs";

interface ForceOption {
  force?: boolean;
}

export const flashAction = async (
  firmwareVersion: string | undefined,
  options: ForceOption,
) => {
  await flashFirmware(firmwareVersion, options.force);
};

export const debugAction = async (
  firmwareVersion: string,
  options: ForceOption,
) => {
  await probeDebug(firmwareVersion, options.force);
};

export const diagnosticAction = async (
  firmwareVersion: string | undefined,
  options: ForceOption,
) => {
  // Firmware with a start-up log traces its own start-up over USB; older
  // firmware gets the diagnostic firmware flashed with the probe.
  if (!firmwareVersion && (await readStartupReport())) {
    await traceStartup();
    return;
  }
  await runDiagnostics(firmwareVersion, options.force);
};

export const firmwareResetAction = async (options: ForceOption) => {
  if (await readStartupReport()) {
    await resetDatalogger();
    console.log(
      "datalogger settings reset to their defaults and sensors removed; the serial number is kept",
    );
    return;
  }
  await clearEeprom("config", options.force);
  // The bootloader check passed (or was skipped) for the erase above.
  await flashFirmware(undefined, true);
};

export const startupAction = async () => {
  const report = await readStartupReport();
  console.log(
    report
      ? describeStartupReport(report)
      : "This firmware doesn't keep a start-up log; update it to see how start-ups went.",
  );
};

export const factoryResetAction = async () => {
  if (!(await readStartupReport())) {
    throw new Error(
      "This firmware doesn't support factory reset over USB; update it first.",
    );
  }
  await factoryReset();
};

export const updateAction = async (
  version: string | undefined,
  options: { file?: string; preRelease?: boolean },
) => {
  if (version && options.file) {
    throw new Error("Give a release version or --file, not both.");
  }
  let shown = -1;
  const installed = await updateFirmware({
    serialPortPath: getSerialPathFromCache(),
    version,
    file: options.file ? fs.readFileSync(options.file) : undefined,
    preRelease: options.preRelease,
    log: (message) => console.log(message),
    onProgress: (written, total) => {
      const percent = Math.floor((written / total) * 100);
      if (percent === shown) return;
      shown = percent;
      process.stdout.write(`\rwriting ${percent}%`);
      if (written === total) process.stdout.write("\n");
    },
  });
  console.log(`firmware ${installed} installed and running`);
  await uploadFirmwareEntry(installed);
};

export const migrateAction = async (version: string | undefined) => {
  const migrated = await migrateFirmware({
    version,
    log: (message) => console.log(message),
  });
  console.log(
    `board migrated: bootloader ${migrated.bootloaderVersion ?? "(unknown version)"}, firmware ${migrated.version}. Update it over USB from now on (rrivctl firmware update).`,
  );
  await uploadFirmwareEntry(migrated.version);
};
