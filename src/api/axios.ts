import axios from "axios";
import { getConfig } from "../util/config.ts";
import { getActiveUser } from "../util/get-logged-in-user.ts";

const rrivApiAxios = axios.create({
  baseURL: getConfig().RRIV_API_URL,
});

rrivApiAxios.interceptors.request.use(async (config) => {
  const user = getActiveUser();
  config.headers.Authorization = `Bearer ${user.accessToken}`;
  return config;
});

export { rrivApiAxios };
