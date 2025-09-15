import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "./src/index.ts",
  output: {
    file: "./dist/index.cjs",
    format: "cjs",
    sourcemap: false,
  },
  plugins: [
    json(),
    commonjs(),
    nodeResolve(),
    typescript({ tsconfig: "./tsconfig.json" }),
  ],
};
