import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { getRrivCtlScriptsDir } from "./paths.ts";

export const loadScript = async (script: string, fileName: string) => {
  const scriptDestination = `${getRrivCtlScriptsDir()}/${fileName}`;
  const file = fs.createWriteStream(scriptDestination);
  await pipeline(fs.createReadStream(path.join(__dirname, `${script}`)), file);
  fs.chmodSync(scriptDestination, 0o755);

  return scriptDestination;
};
