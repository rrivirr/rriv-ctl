import { input, password } from "@inquirer/prompts";
import { SignupDto } from "../api/types.ts";

export const passwordPrompt = async (confirmPassword = false) => {
  const passwordValue = await password({
    message: confirmPassword ? "confirm password" : "password",
    mask: true,
    validate: (v) => (v ? true : false),
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
    validate: (v) => (v ? true : false),
  });
  return value;
};

export const authPrompt = async () => {
  const email = await fieldPrompt("email");
  const passwordValue = await passwordPrompt();

  return { email, password: passwordValue };
};

export const signupPrompt = async (
  body: Partial<Omit<SignupDto, "password">>
) => {
  const { phone, firstName, lastName, email } = body;
  let phoneValue = phone;
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
  if (!phoneValue) {
    phoneValue = await fieldPrompt("phone");
  }

  const password = await getPassword();

  return {
    email: emailValue,
    lastName: lastNameValue,
    firstName: firstNameValue,
    phone: phoneValue,
    password,
  };
};
