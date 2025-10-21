import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";

export const loadScript = async (script: string, fileName: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((process as any).pkg) {
    const file = fs.createWriteStream(fileName);
    await pipeline(
      fs.createReadStream(path.join(__dirname, `${script}`)),
      file
    );
    fs.chmodSync(fileName, 0o755);
  } else {
    throw new Error("unexpected error");
  }
};
