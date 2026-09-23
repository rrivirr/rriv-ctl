import Table from "cli-table3";
import { jwtDecode } from "jwt-decode";
import { blue, bold, italic } from "yoctocolors";
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
import { getLoggedInUser } from "../../util/get-logged-in-user.ts";
import { getConfig } from "../../util/config.ts";
import { errorHandler } from "../../util/error-handler.ts";

export const login = async (email?: string) => {
  try {
    const { activeEmail } = db.data;
    const emailToLogin = email || (activeEmail !== "guest" ? activeEmail : "");
    if (!emailToLogin) {
      console.log(
        `Specify an email with ${italic("rrivctlv2 auth login <email>")}`,
      );
      process.exit();
    }
    const user = getLoggedInUser(emailToLogin);
    if (user) {
      if (emailToLogin !== activeEmail) {
        db.update((data) => {
          data.activeEmail = emailToLogin;
        });
      }
    } else {
      if (
        activeEmail &&
        activeEmail !== "guest" &&
        (!email || email === activeEmail)
      ) {
        console.log(`logging in as ${bold(blue(`${activeEmail}`))}`);
      }
      const password = await passwordPrompt(false, false);
      const { accessToken, expiresIn } = await loginApiCall({
        username: emailToLogin,
        password,
      });
      const now = new Date();
      const decodedToken: JwtPayload = jwtDecode(accessToken);

      db.update((data) => {
        data.activeEmail = emailToLogin;
        data[emailToLogin] = {
          [data.environment.name]: {
            accessToken,
            name: decodedToken.name || emailToLogin,
            expirationTime: +now.setSeconds(now.getSeconds() + expiresIn),
            lastLoginAt:
              data?.[emailToLogin]?.[data.environment.name]?.currentLoginAt,
            currentLoginAt: new Date(),
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
          },
        };
      });
    }

    console.log("authentication successful");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.response) {
      const errorDescription = error.response.data?.error_description;
      if (errorDescription === "Account is not fully set up") {
        console.log(
          `\nYou must verify your email address to log in.
Please check your email and follow the verification link.
To resend the verification email run the command ${italic(`rrivctlv2 auth verify ${email}`)}`,
        );
      } else if (errorDescription === "Invalid user credentials") {
        throw error;
      } else {
        await errorHandler({ error, doNothing: true });
        const now = new Date();
        db.update((data) => {
          data.activeEmail = "guest";
          data["guest"] = {
            [data.environment.name]: {
              accessToken: "guest",
              name: "guest",
              expirationTime: +now.setSeconds(now.getSeconds() + 3600),
              lastLoginAt:
                data?.["guest"]?.[data.environment.name]?.currentLoginAt,
              currentLoginAt: new Date(),
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
            },
          };
        });
      }
    } else {
      throw error;
    }
  }
};

export const logout = () => {
  const { activeEmail, environment } = db.data;
  if (activeEmail && db.data?.[activeEmail]?.[environment.name]) {
    db.update((data) => {
      data[data.activeEmail][data.environment.name] = {
        ...data[data.activeEmail][data.environment.name],
        accessToken: "",
        name: "",
        expirationTime: 0,
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

  console.log("successful");
};

export const signup = async (body: Partial<Omit<SignupDto, "password">>) => {
  const signupBody = await signupPrompt(body);

  await signupApiCall({ ...signupBody });
  const config = getConfig();

  console.log(
    `\nRegistration successful!\nContact an admin to approve your account and start using rrivctl.\n${config.ADMIN_EMAIL || ""}`,
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
