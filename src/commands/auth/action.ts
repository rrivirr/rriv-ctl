import { authenticateUser } from "../../modules/auth/auth.service.ts";

export const authAction = async (options: any) => {
  await authenticateUser(options);
  process.exit();
};
