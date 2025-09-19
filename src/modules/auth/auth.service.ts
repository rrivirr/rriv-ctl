import Table from "cli-table3";
import { jwtDecode } from "jwt-decode";
import {
  login as loginApiCall,
  signup as signupApiCall,
  verify as verifyApiCall,
  resetPassword as resetPasswordApiCall,
} from "../../api/auth.ts";
import { SignupDto } from "../../api/types.ts";
import db from "../../db/db.ts";
import { passwordPrompt, signupPrompt } from "../../prompts/auth.prompt.ts";
import { JwtPayload } from "../../types.ts";
import { italic } from "yoctocolors";

export const login = async (email: string) => {
  try {
    const { accessToken: existingAccessToken } = db.data;
    const password = await passwordPrompt(false, false);
    const { accessToken, expiresIn } = await loginApiCall({
      username: email,
      password,
    });

    if (existingAccessToken) {
      const oldDecodedToken: JwtPayload = jwtDecode(existingAccessToken);
      const newDecodedToken: JwtPayload = jwtDecode(accessToken);

      if (oldDecodedToken.email !== newDecodedToken.email) {
        // clear cached information
        logout();
      }
    }
    const now = new Date();
    db.update((data) => {
      data.accessToken = accessToken;
      data.expirationTime = +now.setSeconds(now.getSeconds() + expiresIn);
    });

    console.log("authentication successful");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (
      error?.response?.data?.error_description === "Account is not fully set up"
    ) {
      console.log(
        `\nYou must verify your email address to log in.
Please check your email and follow the verification link.
To resend the verification email run the command ${italic(`rrivctl auth verify ${email}`)}`
      );
      return;
    }
    throw error;
  }
};

export const logout = () => {
  db.update((data) => {
    data.accessToken = "";
    data.expirationTime = 1970;
    data.context = {
      id: "",
      name: "",
    };
    data.deviceContext = {
      contextId: "",
      deviceId: "",
      assignedDeviceName: "",
    };
    data.device = {
      id: "",
      serialNumber: "",
      serialPortPath: "",
      uniqueName: "",
    };
  });
};

export const signup = async (body: Partial<Omit<SignupDto, "password">>) => {
  const { accessToken } = db.data;
  const signupBody = await signupPrompt(body);

  await signupApiCall({ ...signupBody, accessToken });
  console.log(
    "\nSignup complete. You must verify your email address to log in.\nPlease check your email and follow the verification link."
  );
};

export const verify = async (email: string) => {
  await verifyApiCall({ email });

  console.log("A verification email should be received shortly");
};

export const resetPassword = async (email: string) => {
  await resetPasswordApiCall({ email });
  console.log("A password reset email will be sent if the email is valid");
};

export const whoami = async () => {
  const { accessToken, expirationTime } = db.data;

  if (!expirationTime || !accessToken || Date.now() > expirationTime) {
    console.log("no user logged in at the moment");
  } else {
    const decodedToken: JwtPayload = jwtDecode(accessToken);
    const table = new Table({
      head: ["name", "email"],
      wordWrap: true,
      wrapOnWordBoundary: false,
    });
    table.push([decodedToken.name, decodedToken.email]);
    console.log(table.toString());
  }
};
