import { bold, blue, underline } from "yoctocolors";
import db from "../db/db.ts";

export const pronounce = (phrase: string) => {
  return underline(blue(bold(`${phrase}`)));
};

export const logToConsole = (...args: unknown[]) => {
  const context = db.data.context.name;
  const device = db.data.deviceContext.assignedDeviceName;
  console.log(pronounce(`${context}:${device}`), "=>", ...args);
};
