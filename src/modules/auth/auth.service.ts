import Table from "cli-table3";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { authUserApiCall, signup as signupApiCall } from "../../api/auth.ts";
import { SignupDto } from "../../api/types.ts";
import db from "../../db/db.ts";
import { passwordPrompt, signupPrompt } from "../../prompts/auth.prompt.ts";

export const authenticateUser = async (body: { email: string }) => {
  const { email } = body;
  const password = await passwordPrompt();
  const { accessToken, expiresIn } = await authUserApiCall({
    username: email,
    password,
  });
  const now = new Date();

  db.update((data) => {
    data.accessToken = accessToken;
    data.expirationTime = +now.setSeconds(now.getSeconds() + expiresIn);
  });

  console.log("authentication successful");
};

export const logout = () => {
  db.update((data) => {
    data.accessToken = "";
    data.expirationTime = 1970;
  });
};

export const signup = async (body: Partial<Omit<SignupDto, "password">>) => {
  const { accessToken } = db.data;
  const signupBody = await signupPrompt(body);

  await signupApiCall({ ...signupBody, accessToken });
  console.log("signup successful");
};

export const whoami = async () => {
  const { accessToken, expirationTime } = db.data;

  if (!expirationTime || !accessToken || Date.now() > expirationTime) {
    console.log("no user logged in at the moment");
  } else {
    const decodedToken: JwtPayload & { name: string; email: string } =
      jwtDecode(accessToken);
    const table = new Table({
      head: ["name", "email"],
      wordWrap: true,
      wrapOnWordBoundary: false,
    });
    table.push([decodedToken.name, decodedToken.email]);
    console.log(table.toString());
  }
};
