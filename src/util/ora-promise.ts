import { oraPromise as op } from "ora";
import db from "../db/db.ts";

export const oraPromise = async (f: () => Promise<any>) => {
  const { spinner } = db.data;
  const spinnerToUse = spinner || "simpleDots";
  return await op(f, { spinner: spinnerToUse as any });
};
