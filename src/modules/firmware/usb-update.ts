import { createHash } from "node:crypto";
import { ReadlineParser, SerialPort } from "serialport";
import {
  type FirmwareRelease,
  downloadSignedImage,
  listFirmwareReleases,
} from "../../api/firmware.ts";
import { DefaultObject } from "../../types.ts";
import { isReady, readAfterRestart } from "./board-commands.ts";

/**
 * `firmware update`: install a signed image over USB through the RRIV
 * bootloader, with no probe. The image format and the bootloader's commands
 * (`info`, `begin`, `write`, `finish`, `boot`) are defined in rriv-firmware's
 * `board/rriv_boot`; this mirrors the web app's install.
 */

export const IMAGE_HEADER_SIZE = 512;
/** Bytes per `write`; the bootloader accepts up to 512. */
export const BLOCK_SIZE = 512;
const HASH_OFFSET = 48;

export interface SignedImage {
  bytes: Buffer;
  /** Firmware version from the header. */
  version: string;
  /** Firmware size in bytes, header excluded. */
  appSize: number;
}

/**
 * Read a signed image's header. This only checks the format; the bootloader
 * checks the signature at the first block and the hash at `finish`.
 */
export const parseSignedImage = (bytes: Buffer): SignedImage => {
  const notSigned =
    "This isn't a signed RRIV firmware image (.bin from rriv_image sign).";
  if (bytes.length <= IMAGE_HEADER_SIZE) throw new Error(notSigned);
  if (bytes.subarray(0, 4).toString("latin1") !== "RRIV")
    throw new Error(notSigned);
  if (
    bytes.readUInt16LE(4) !== 1 ||
    bytes.readUInt16LE(6) !== IMAGE_HEADER_SIZE
  ) {
    throw new Error(
      "This image uses a header format this rrivctl doesn't know.",
    );
  }
  const appSize = bytes.readUInt32LE(8);
  if (appSize !== bytes.length - IMAGE_HEADER_SIZE) {
    throw new Error(
      "This image is incomplete or has extra bytes: its size doesn't match its header.",
    );
  }
  const field = bytes.subarray(16, 48);
  const end = field.indexOf(0);
  const version = field
    .subarray(0, end === -1 ? field.length : end)
    .toString("latin1");
  return { bytes, version, appSize };
};

/**
 * `parseSignedImage`, plus the image against the SHA-256 in its header. The
 * bootloader only finds out at `finish`, after replacing the installed
 * firmware, so this runs before anything is sent.
 */
const readIntactImage = (bytes: Buffer): SignedImage => {
  const image = parseSignedImage(bytes);
  const digest = createHash("sha256")
    .update(bytes.subarray(IMAGE_HEADER_SIZE))
    .digest();
  if (!digest.equals(bytes.subarray(HASH_OFFSET, HASH_OFFSET + digest.length))) {
    throw new Error(
      "This image is damaged: it doesn't match the hash in its header.",
    );
  }
  return image;
};

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

/** Standard CRC-32 (as zlib computes it), which `write` checks each block with. */
export const crc32 = (bytes: Uint8Array) => {
  let crc = 0xffffffff;
  for (const byte of bytes)
    crc = (CRC_TABLE[(crc ^ byte) & 0xff] ?? 0) ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

/** A `{"status":"error",…}` reply. */
export class BoardError extends Error {
  constructor(readonly reply: DefaultObject) {
    super(
      [reply.message, reply.error].filter(Boolean).join(": ") ||
        "the board reported an error",
    );
  }
}

/** One JSON command per line, one reply per command. */
export interface LineSession {
  send: (command: DefaultObject, timeoutMs?: number) => Promise<DefaultObject>;
  close: () => Promise<void>;
}

/**
 * Keep the port open for the whole install (hundreds of `write`s), unlike
 * `sendSingleCommand`, which opens it per command. Replies are the first JSON
 * line that isn't the firmware's echo (which contains "action"; the
 * bootloader's replies never do).
 */
export const openLineSession = (
  path: string,
  timeoutMs = 10_000,
): Promise<LineSession> =>
  new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const attempt = () => {
      const port = new SerialPort({ path, baudRate: 115200, autoOpen: false });
      port.open((error) => {
        if (error) {
          // Still re-enumerating after a reset.
          if (Date.now() < deadline) setTimeout(attempt, 500);
          else reject(new Error(`Couldn't open ${path}: ${error.message}`));
          return;
        }
        resolve(lineSession(port));
      });
    };
    attempt();
  });

const lineSession = (port: SerialPort): LineSession => {
  const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));
  let waiting: ((reply: DefaultObject) => void) | null = null;
  parser.on("data", (raw: string) => {
    const line = raw.trim();
    if (!waiting || !line.startsWith("{") || line.includes('"action"')) return;
    try {
      const reply = JSON.parse(line);
      // Start-up trace lines ({"startup":"<step>"}) and the ready status
      // aren't replies; `board get startup`'s {"startup":{…}} is.
      if (
        typeof reply?.startup === "string" ||
        reply?.status === "datalogger-ready"
      )
        return;
      const done = waiting;
      waiting = null;
      done(reply);
    } catch {
      // Not JSON: something else the board printed.
    }
  });
  return {
    send: (command, timeoutMs = 5000) =>
      new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          waiting = null;
          reject(new Error("Timed out waiting for the board to reply."));
        }, timeoutMs);
        waiting = (reply) => {
          clearTimeout(timer);
          if (reply.status === "error") reject(new BoardError(reply));
          else resolve(reply);
        };
        port.write(JSON.stringify(command) + "\n");
      }),
    close: () =>
      new Promise((resolve) => {
        if (!port.isOpen) return resolve();
        port.close(() => resolve());
      }),
  };
};

export interface BootloaderInfo {
  version: string | null;
  appValid: boolean;
  appVersion: string | null;
  /** Why the installed firmware was refused (e.g. `hash_mismatch`). */
  appError: string | null;
  /** Set when the bootloader held the firmware back after unfinished start-ups. */
  startupLoop: { stoppedAt: string; unfinished: number } | null;
}

export const readBootloaderInfo = async (
  session: LineSession,
): Promise<BootloaderInfo> => {
  const reply = await session.send({ object: "bootloader", action: "info" });
  return {
    version: typeof reply.version === "string" ? reply.version : null,
    appValid: reply.app_valid === true,
    appVersion:
      typeof reply.app_version === "string" ? reply.app_version : null,
    appError: typeof reply.app_error === "string" ? reply.app_error : null,
    startupLoop:
      reply.startup_loop && typeof reply.startup_loop === "object"
        ? {
            stoppedAt: String(reply.startup_loop.stopped_at ?? "unknown"),
            unfinished: Number(reply.startup_loop.unfinished) || 0,
          }
        : null,
  };
};

/** True when the board is in the bootloader (it answers app commands so). */
export const inBootloader = async (session: LineSession) => {
  try {
    await session.send({
      object: "board",
      action: "get",
      parameter: "version",
    });
    return false;
  } catch (error) {
    if (
      error instanceof BoardError &&
      error.reply.message === "in bootloader mode"
    )
      return true;
    throw error;
  }
};

/** Why the bootloader refused an image's header, before erasing anything. */
const HEADER_REFUSALS: Record<string, string> = {
  bad_signature: "Image not signed for this board.",
  bad_size: "Image size doesn't match its header.",
  unsupported_header: "Image needs a newer bootloader.",
  no_header: "Not a signed RRIV image.",
};

/**
 * `begin`, every block with `write`, then `finish`. The first block is the
 * header: the bootloader checks its signature before erasing anything.
 * Resolves with the installed version; the board stays in the bootloader.
 */
export const installImage = async (
  session: LineSession,
  image: SignedImage,
  onProgress: (written: number, total: number) => void = () => undefined,
) => {
  const total = image.bytes.length;
  await session.send({ object: "bootloader", action: "begin", size: total });
  for (let offset = 0; offset < total; offset += BLOCK_SIZE) {
    const block = image.bytes.subarray(offset, offset + BLOCK_SIZE);
    try {
      await session.send({
        object: "bootloader",
        action: "write",
        offset,
        data: block.toString("base64"),
        crc: crc32(block),
      });
    } catch (error) {
      const code = error instanceof BoardError ? error.reply.error : undefined;
      if (offset === 0 && typeof code === "string" && HEADER_REFUSALS[code])
        throw new Error(HEADER_REFUSALS[code]);
      throw error;
    }
    onProgress(offset + block.length, total);
  }
  // The full check (SHA-256 and signature) takes a few seconds.
  const done = await session.send(
    { object: "bootloader", action: "finish" },
    15_000,
  );
  return typeof done.app_version === "string"
    ? done.app_version
    : image.version;
};

/**
 * The release to install: `version` if given, else the newest one the board's
 * bootloader can take (pre-releases only with `preRelease`). Releases rriv-api
 * marked incompatible are never picked.
 */
export const chooseRelease = (
  releases: FirmwareRelease[],
  version: string | undefined,
  preRelease: boolean,
  bootloader: string | null,
): FirmwareRelease => {
  const tooOld = (release: FirmwareRelease) =>
    `${release.version} needs bootloader ${release.minBootloader} or newer; this board has ${bootloader ?? "an unknown version"}. Updating the bootloader needs a probe.`;
  if (version) {
    const release = releases.find((r) => r.version === version);
    if (!release) throw new Error(`No release ${version} with a signed image.`);
    if (release.compatible === false) throw new Error(tooOld(release));
    return release;
  }
  const candidates = releases.filter((r) => preRelease || !r.prerelease);
  const release = candidates.find((r) => r.compatible !== false);
  if (release) return release;
  if (candidates[0]) throw new Error(tooOld(candidates[0]));
  throw new Error("No signed releases yet.");
};

export interface UpdateOptions {
  serialPortPath: string;
  /** A release version; default: the newest the board can take. */
  version?: string;
  /** A signed image file instead of a release. */
  file?: Buffer;
  preRelease?: boolean;
  log?: (message: string) => void;
  onProgress?: (written: number, total: number) => void;
}

/** What `updateFirmware` talks to; replaced in tests. */
export interface UpdateDeps {
  openSession: (path: string) => Promise<LineSession>;
  listReleases: (bootloader?: string | null) => Promise<FirmwareRelease[]>;
  downloadImage: (version: string) => Promise<Buffer>;
  waitForApp: (path: string) => Promise<void>;
  pause: (ms: number) => Promise<void>;
}

const defaultDeps: UpdateDeps = {
  openSession: (path) => openLineSession(path),
  listReleases: listFirmwareReleases,
  downloadImage: downloadSignedImage,
  waitForApp: (path) => readAfterRestart(path, isReady, 60_000),
  pause: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};

/** How long a board takes to reset and drop off USB. */
const RESET_MS = 1500;

/**
 * Install firmware over USB: restart into the bootloader if the board runs its
 * firmware, check the release fits its bootloader, write the image, start it.
 * Anything that fails before the image is sent leaves the firmware as it was
 * (and running, if it was). Resolves with the installed version.
 */
export const updateFirmware = async (
  options: UpdateOptions,
  deps: UpdateDeps = defaultDeps,
): Promise<string> => {
  const log = options.log ?? (() => undefined);
  const path = options.serialPortPath;
  const fromFile = options.file ? readIntactImage(options.file) : null;
  // Before touching the board, so a login or network problem changes nothing.
  if (!fromFile) await deps.listReleases();

  let session = await deps.openSession(path);
  let fromApp = false;
  try {
    if (!(await inBootloader(session))) {
      log("restarting into update mode...");
      await session.send({ object: "board", action: "bootloader" });
      await session.close();
      await deps.pause(RESET_MS);
      session = await deps.openSession(path);
      fromApp = true;
      if (!(await inBootloader(session)))
        throw new Error("The board didn't restart into update mode.");
    }
    const info = await readBootloaderInfo(session);

    let image: SignedImage;
    try {
      if (fromFile) {
        image = fromFile;
      } else {
        const releases = await deps.listReleases(info.version);
        const release = chooseRelease(
          releases,
          options.version,
          options.preRelease ?? false,
          info.version,
        );
        log(`downloading ${release.version}...`);
        image = readIntactImage(await deps.downloadImage(release.version));
      }
    } catch (error) {
      // Nothing was written: go back to the firmware the board was running.
      if (fromApp && info.appValid) {
        await session.send({ object: "bootloader", action: "boot" });
        await session.close();
        await deps.waitForApp(path);
      }
      throw error;
    }

    log(
      `installing ${image.version || "the image"} (bootloader ${info.version ?? "unknown"})...`,
    );
    const installed = await installImage(session, image, options.onProgress);
    log("starting the new firmware...");
    await session.send({ object: "bootloader", action: "boot" });
    await session.close();
    await deps.waitForApp(path);
    return installed;
  } finally {
    await session.close();
  }
};
