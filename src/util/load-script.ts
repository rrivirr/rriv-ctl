import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";

export const loadScript = async (script: string, fileName: string) => {
  const file = fs.createWriteStream(fileName);
  await pipeline(fs.createReadStream(path.join(__dirname, `${script}`)), file);
  fs.chmodSync(fileName, 0o755);
};
