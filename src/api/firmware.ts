import { rrivApiAxios } from "./axios.ts";

/** A rriv-firmware release with a signed image (`GET /firmware/releases`). */
export interface FirmwareRelease {
  /** Release tag; also the version in the image header (`fv`). */
  version: string;
  name: string;
  publishedAt: string | null;
  prerelease: boolean;
  notes: string;
  /** The bootloader built with this release. */
  bootloaderVersion: string | null;
  /** The oldest bootloader this release works with; null: no requirement. */
  minBootloader: string | null;
  /** Whether the bootloader given in the query is new enough. */
  compatible?: boolean;
  size: number;
}

/**
 * Releases, newest first. With the board's bootloader version (`x.y.z`),
 * rriv-api marks each one `compatible` or not.
 */
export const listFirmwareReleases = async (
  bootloader?: string | null,
): Promise<FirmwareRelease[]> => {
  const response = await rrivApiAxios.get(`/firmware/releases`, {
    params:
      bootloader && /^\d+\.\d+\.\d+$/.test(bootloader)
        ? { bootloader }
        : undefined,
  });
  return response.data;
};

/** A release's signed image. */
export const downloadSignedImage = async (version: string): Promise<Buffer> => {
  const response = await rrivApiAxios.get(
    `/firmware/releases/${encodeURIComponent(version)}/image`,
    { responseType: "arraybuffer" },
  );
  return Buffer.from(response.data);
};
