import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import replace from "@rollup/plugin-replace";
import dotenv from "dotenv";
dotenv.config();

const env = {
  preventAssignment: true,
  "process.env.DATA_API_URL": JSON.stringify(process.env.DATA_API_URL),
  "process.env.KEYCLOAK_URL": JSON.stringify(process.env.KEYCLOAK_URL),
  "process.env.RRIV_API_URL": JSON.stringify(process.env.RRIV_API_URL),
  "process.env.KEYCLOAK_CLIENT_ID": JSON.stringify(
    process.env.KEYCLOAK_CLIENT_ID
  ),
  "process.env.SPACES_ACCESS_KEY": JSON.stringify(
    process.env.SPACES_ACCESS_KEY
  ),
  "process.env.SPACES_SECRET_KEY": JSON.stringify(
    process.env.SPACES_SECRET_KEY
  ),
  "process.env.SPACES_ENDPOINT": JSON.stringify(process.env.SPACES_ENDPOINT),
  "process.env.MQTT_URL": JSON.stringify(process.env.MQTT_URL),
  "process.env.ADMIN_EMAIL": JSON.stringify(process.env.ADMIN_EMAIL),
};

export default {
  input: "./src/index.ts",
  external: ["serialport"],
  output: {
    dir: "./dist",
    entryFileNames: "index.cjs",
    format: "cjs",
    sourcemap: true,
  },
  plugins: [
    json(),
    terser(),
    commonjs(),
    replace(env),
    nodeResolve(),
    typescript({ tsconfig: "./tsconfig.json" }),
  ],
};
