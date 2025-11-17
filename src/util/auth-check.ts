import { italic } from "yoctocolors";
import { getLoggedInUser } from "./get-logged-in-user.ts";

export const authCheck = async () => {
  const user = getLoggedInUser();

  if (!user) {
    console.log(
      `You are not logged in.\nYou may log in with ${italic("rrivctlv2 auth login <email>")}\nOr sign up an account with ${italic("rrivctlv2 auth signup")}`
    );
    process.exit();
  }
};
