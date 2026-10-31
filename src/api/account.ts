import { rrivApiAxios } from "./axios.ts";

export interface Me {
  id: string;
  email: string;
  isAdmin: boolean;
  isProvisioner: boolean;
}

export const getMe = async (): Promise<Me> => {
  const response = await rrivApiAxios.get(`/account/me`);
  return response.data;
};
