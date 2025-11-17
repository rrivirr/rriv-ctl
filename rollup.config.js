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
};

export default {
  input: "./src/index.ts",
  external: ["serialport"],
  output: {
    file: "./dist/index.cjs",
    format: "cjs",
    sourcemap: false,
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
