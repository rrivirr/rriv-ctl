import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { FirmwareRelease } from "../../../src/api/firmware.ts";
import {
  BoardError,
  type LineSession,
  type UpdateDeps,
  chooseRelease,
  crc32,
  parseSignedImage,
  updateFirmware,
} from "../../../src/modules/firmware/usb-update.ts";
import type { DefaultObject } from "../../../src/types.ts";

/** A signed image as rriv_image writes it (the signature isn't checked here). */
const signedImage = (version: string, appSize: number) => {
  const bytes = Buffer.alloc(512 + appSize, 0xff);
  bytes.write("RRIV", 0, "latin1");
  bytes.writeUInt16LE(1, 4);
  bytes.writeUInt16LE(512, 6);
  bytes.writeUInt32LE(appSize, 8);
  bytes.writeUInt32LE(0, 12);
  bytes.fill(0, 16, 48);
  bytes.write(version, 16, "latin1");
  for (let i = 512; i < bytes.length; i += 1) bytes[i] = i % 251;
  createHash("sha256").update(bytes.subarray(512)).digest().copy(bytes, 48);
  return bytes;
};

/** A signed image whose body no longer matches its header's hash. */
const damaged = (image: Buffer) => {
  const bytes = Buffer.from(image);
  bytes[bytes.length - 1] = (bytes[bytes.length - 1] ?? 0) ^ 0xff;
  return bytes;
};

const release = (
  version: string,
  overrides: Partial<FirmwareRelease> = {},
): FirmwareRelease => ({
  version,
  name: version,
  publishedAt: "2026-10-28T12:00:00Z",
  prerelease: false,
  notes: "",
  bootloaderVersion: "1.0.0",
  minBootloader: null,
  size: 0,
  ...overrides,
});

/**
 * A board on one port: its firmware, or the bootloader after `board
 * bootloader` (and back after `boot`). Each `openSession` talks to whichever
 * is running.
 */
const fakeBoard = (options: {
  mode: "app" | "bootloader";
  bootloaderVersion?: string;
  refuseHeader?: string;
}) => {
  const board = {
    mode: options.mode,
    commands: [] as DefaultObject[],
    received: [] as Buffer[],
    opens: 0,
  };
  const reply = (command: DefaultObject): DefaultObject => {
    board.commands.push(command);
    if (board.mode === "app") {
      if (command.object === "board" && command.action === "bootloader") {
        board.mode = "bootloader";
        return { message: "restarting into bootloader" };
      }
      return { message: '{"fv":"1.15.0"}' };
    }
    if (command.object !== "bootloader") {
      return {
        status: "error",
        message: "in bootloader mode",
        error: "unsupported command",
      };
    }
    switch (command.action) {
      case "info":
        return {
          bootloader: "rriv",
          version: options.bootloaderVersion ?? "1.0.0",
          app_valid: true,
          app_version: "1.15.0",
        };
      case "begin":
        board.received = [];
        return { message: "ready", block: 512 };
      case "write": {
        if (command.offset === 0 && options.refuseHeader) {
          return {
            status: "error",
            message: "image refused",
            error: options.refuseHeader,
          };
        }
        const block = Buffer.from(command.data, "base64");
        if (crc32(block) !== command.crc) {
          return { status: "error", message: "block crc mismatch", error: "" };
        }
        board.received.push(block);
        return { message: "ok", offset: command.offset + block.length };
      }
      case "finish":
        return { message: "installed", app_version: "2.0.0" };
      case "boot":
        board.mode = "app";
        return { message: "booting" };
      default:
        return {
          status: "error",
          message: "unknown bootloader command",
          error: "",
        };
    }
  };
  const session = (): LineSession => ({
    send: async (command) => {
      const answer = reply(command);
      if (answer.status === "error") throw new BoardError(answer);
      return answer;
    },
    close: async () => undefined,
  });
  return { board, session };
};

const deps = (
  fake: ReturnType<typeof fakeBoard>,
  releases: FirmwareRelease[],
  images: Record<string, Buffer> = {},
): UpdateDeps & { asked: (string | null | undefined)[] } => {
  const asked: (string | null | undefined)[] = [];
  return {
    asked,
    openSession: async () => {
      fake.board.opens += 1;
      return fake.session();
    },
    listReleases: async (bootloader) => {
      asked.push(bootloader);
      return releases;
    },
    downloadImage: async (version) => images[version]!,
    waitForApp: async () => undefined,
    pause: async () => undefined,
  };
};

describe("signed images", () => {
  it("reads the header and refuses what isn't one", () => {
    expect(parseSignedImage(signedImage("2.0.0", 1300))).toMatchObject({
      version: "2.0.0",
      appSize: 1300,
    });
    expect(() => parseSignedImage(Buffer.alloc(1000))).toThrow(
      /isn't a signed RRIV/,
    );
    expect(() =>
      parseSignedImage(signedImage("2.0.0", 1300).subarray(0, 1000)),
    ).toThrow(/size doesn't match/);
  });

  it("uses the standard CRC-32", () => {
    expect(crc32(Buffer.from("123456789"))).toBe(0xcbf43926);
  });
});

describe("chooseRelease", () => {
  const releases = [
    release("2.1.0-beta.1", { prerelease: true }),
    release("2.1.0", { minBootloader: "1.1.0", compatible: false }),
    release("2.0.0", { compatible: true }),
  ];

  it("picks the newest release the bootloader can take", () => {
    expect(chooseRelease(releases, undefined, false, "1.0.0").version).toBe(
      "2.0.0",
    );
    expect(chooseRelease(releases, undefined, true, "1.0.0").version).toBe(
      "2.1.0-beta.1",
    );
  });

  it("refuses a requested release the bootloader is too old for", () => {
    expect(() => chooseRelease(releases, "2.1.0", false, "1.0.0")).toThrow(
      /^2\.1\.0 needs bootloader 1\.1\.0 or newer; this board has 1\.0\.0\./,
    );
    expect(() => chooseRelease(releases, "9.9.9", false, "1.0.0")).toThrow(
      /No release 9\.9\.9/,
    );
  });
});

describe("updateFirmware", () => {
  it("restarts into the bootloader, installs the newest compatible release and starts it", async () => {
    const image = signedImage("2.0.0", 1300);
    const fake = fakeBoard({ mode: "app" });
    const releases = [
      release("2.1.0", { minBootloader: "1.1.0", compatible: false }),
      release("2.0.0", {
        size: image.length,
        compatible: true,
      }),
    ];
    const d = deps(fake, releases, { "2.0.0": image });

    const installed = await updateFirmware({ serialPortPath: "/dev/test" }, d);

    expect(installed).toBe("2.0.0");
    // Listed first (login, network), then with the board's bootloader version.
    expect(d.asked).toEqual([undefined, "1.0.0"]);
    expect(Buffer.concat(fake.board.received)).toEqual(image);
    expect(fake.board.commands.map((c) => c.action)).toEqual([
      "get",
      "bootloader",
      "get",
      "info",
      "begin",
      "write",
      "write",
      "write",
      "write",
      "finish",
      "boot",
    ]);
    expect(fake.board.mode).toBe("app");
  });

  it("writes nothing when the requested release needs a newer bootloader, and goes back to the firmware", async () => {
    const fake = fakeBoard({ mode: "app", bootloaderVersion: "1.0.0" });
    const d = deps(fake, [
      release("2.1.0", { minBootloader: "1.1.0", compatible: false }),
    ]);

    await expect(
      updateFirmware({ serialPortPath: "/dev/test", version: "2.1.0" }, d),
    ).rejects.toThrow(/needs bootloader 1\.1\.0 or newer/);
    expect(fake.board.commands.map((c) => c.action)).not.toContain("begin");
    expect(fake.board.commands.at(-1)).toEqual({
      object: "bootloader",
      action: "boot",
    });
    expect(fake.board.mode).toBe("app");
  });

  it("explains a header the bootloader refuses before erasing", async () => {
    const fake = fakeBoard({
      mode: "bootloader",
      refuseHeader: "bad_signature",
    });
    const d = deps(fake, []);

    await expect(
      updateFirmware(
        { serialPortPath: "/dev/test", file: signedImage("2.0.0", 700) },
        d,
      ),
    ).rejects.toThrow(/^Image not signed for this board\.$/);
    expect(fake.board.received).toHaveLength(0);
    // A file needs no release list.
    expect(d.asked).toEqual([]);
  });

  it("refuses a damaged download and stays in update mode if it was there", async () => {
    const fake = fakeBoard({ mode: "bootloader" });
    const d = deps(fake, [release("2.0.0")], {
      "2.0.0": damaged(signedImage("2.0.0", 1300)),
    });

    await expect(
      updateFirmware({ serialPortPath: "/dev/test" }, d),
    ).rejects.toThrow(/image is damaged/);
    expect(fake.board.commands.map((c) => c.action)).not.toContain("begin");
    expect(fake.board.mode).toBe("bootloader");
  });

  it("goes back to the firmware after a damaged download", async () => {
    const fake = fakeBoard({ mode: "app" });
    const d = deps(fake, [release("2.0.0")], {
      "2.0.0": damaged(signedImage("2.0.0", 1300)),
    });

    await expect(
      updateFirmware({ serialPortPath: "/dev/test" }, d),
    ).rejects.toThrow(/image is damaged/);
    expect(fake.board.commands.map((c) => c.action)).not.toContain("begin");
    expect(fake.board.mode).toBe("app");
  });

  it("refuses a damaged file before opening the board", async () => {
    const fake = fakeBoard({ mode: "app" });
    const d = deps(fake, []);

    await expect(
      updateFirmware(
        {
          serialPortPath: "/dev/test",
          file: damaged(signedImage("2.0.0", 700)),
        },
        d,
      ),
    ).rejects.toThrow(/image is damaged/);
    expect(fake.board.opens).toBe(0);
  });

  it("installs an image whatever release it was listed under", async () => {
    const image = signedImage("2.0.0", 700);
    const fake = fakeBoard({ mode: "bootloader" });
    const d = deps(fake, [release("2.0.1")], { "2.0.1": image });

    await updateFirmware({ serialPortPath: "/dev/test" }, d);

    expect(Buffer.concat(fake.board.received)).toEqual(image);
  });
});
