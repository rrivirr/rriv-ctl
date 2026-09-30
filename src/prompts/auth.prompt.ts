import { password } from "@inquirer/prompts";

export const passwordPrompt = async (
  confirmPassword = false,
  validate = true,
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
            "consider using at least four random words, each with a capital letter",
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
