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
import { getLoggedInUser } from "../../util/get-logged-in-user.ts";

export const login = async (email: string) => {
  try {
    const user = getLoggedInUser(email);
    if (user) {
      db.update((data) => {
        data.activeEmail = email;
      });
    } else {
      const password = await passwordPrompt(false, false);
      const { accessToken, expiresIn } = await loginApiCall({
        username: email,
        password,
      });
      const now = new Date();
      const decodedToken: JwtPayload = jwtDecode(accessToken);

      db.update((data) => {
        data.activeEmail = email;
        data[email] = {
          accessToken,
          name: decodedToken.name,
          expirationTime: +now.setSeconds(now.getSeconds() + expiresIn),
          lastLoginAt: new Date(),
          toSync: [],
          context: { id: "", name: "" },
          device: {
            id: "",
            uniqueName: "",
            serialNumber: "",
            serialPortPath: "",
          },
          deviceContext: {
            contextId: "",
            deviceId: "",
            assignedDeviceName: "",
          },
        };
      });
    }

    console.log("authentication successful");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (
      error?.response?.data?.error_description === "Account is not fully set up"
    ) {
      console.log(
        `\nYou must verify your email address to log in.
Please check your email and follow the verification link.
To resend the verification email run the command ${italic(`rrivctlv2 auth verify ${email}`)}`
      );
      return;
    }
    throw error;
  }
};

export const logout = () => {
  db.update((data) => {
    delete data[data.activeEmail];
    data.activeEmail = "";
  });
  console.log("successful");
};

export const signup = async (body: Partial<Omit<SignupDto, "password">>) => {
  const signupBody = await signupPrompt(body);

  await signupApiCall({ ...signupBody });
  if (signupBody.email.includes("rriv.org")) {
    console.log(
      "\nSignup complete. You must verify your email address to log in.\nPlease check your email and follow the verification link."
    );
  } else {
    console.log(
      `\nYour email is not a @rriv.org address, and therefore requires manual verification.\nPlease contact the platform administrators to verify your account.`
    );
  }
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
  const user = getLoggedInUser();

  if (!user) {
    console.log("no user logged in at the moment");
  } else {
    const table = new Table({
      head: ["name", "email"],
      wordWrap: true,
      wrapOnWordBoundary: false,
    });
    table.push([user.name, user.email]);
    console.log(table.toString());
  }
};
