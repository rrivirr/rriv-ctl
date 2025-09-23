import { input, password } from "@inquirer/prompts";
import { SignupDto } from "../api/types.ts";

export const passwordPrompt = async (
  confirmPassword = false,
  validate = true
) => {
  let recommendationLogged = false;
  const passwordValue = await password({
    message: confirmPassword ? "confirm password" : "password",
    mask: true,
    validate: (v) => {
      if (!validate) {
        return true;
      }
      if (v.length < 10) {
        if (!recommendationLogged) {
          console.log(
            "consider using at least four random words, each with a capital letter"
          );
          recommendationLogged = true;
        }
        return `password should be at least 10 characters`;
      } else if (v === v.toLowerCase()) {
        return `password should contain at least one capital letter`;
      } else {
        return true;
      }
    },
  });

  return passwordValue;
};

const getPassword = async () => {
  const password = await passwordPrompt();
  const confirmPassword = await passwordPrompt(true);

  if (password === confirmPassword) {
    return password;
  }

  console.log("passwords do not match");
  return getPassword();
};

const fieldPrompt = async (field: string) => {
  const value = await input({
    message: field,
    validate: (v) => {
      if (v?.length >= 3) {
        return true;
      }
      return "should be at least 3 characters";
    },
  });
  return value;
};

export const signupPrompt = async (
  body: Partial<Omit<SignupDto, "password">>
) => {
  const { firstName, lastName, email } = body;
  let firstNameValue = firstName;
  let lastNameValue = lastName;
  let emailValue = email;

  if (!firstNameValue) {
    firstNameValue = await fieldPrompt("first name");
  }
  if (!lastNameValue) {
    lastNameValue = await fieldPrompt("last name");
  }
  if (!emailValue) {
    emailValue = await fieldPrompt("email");
  }

  const password = await getPassword();

  return {
    email: emailValue,
    lastName: lastNameValue,
    firstName: firstNameValue,
    password,
  };
};
