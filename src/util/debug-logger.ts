import db from "../db/db.ts";

export const inDebugMode = () => {
  const { debugMode } = db.data;
  return debugMode;
};

export const logAsDebug = (...args: unknown[]) => {
  if (inDebugMode()) {
    console.log(...args);
  }
};
