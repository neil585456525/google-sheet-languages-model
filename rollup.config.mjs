import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import del from 'rollup-plugin-delete'

export default defineConfig({
  plugins: [
    del({ targets: 'dist/*' }),
    typescript({ tsconfig: "./tsconfig.build.json" })
  ],
  external: ['googleapis'],
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "cjs",
  },
});
