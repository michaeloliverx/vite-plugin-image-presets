import type { Options } from "tsup";

export const tsup: Options = {
  splitting: false,
  clean: true,
  entryPoints: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
};
