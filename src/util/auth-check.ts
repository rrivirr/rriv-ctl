import { italic } from "yoctocolors";
import db from "../db/db.ts";

export const authCheck = async () => {
  const { expirationTime, accessToken } = db.data;

  if (Date.now() < expirationTime && accessToken) {
    console.log("are we getting here");
    return;
  }

  console.log(
    `You are not logged in.\nYou may log in with ${italic("rrivctl auth login <email>")}\nOr sign up an account with ${italic("rrivctl auth signup")}`
  );
  process.exit();
};
