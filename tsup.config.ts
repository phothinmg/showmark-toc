import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["./src/mod.ts"],
    outDir: "./dist",
    splitting: true,
    sourcemap: true,
    dts: true,
    format: "esm",
    bundle: true,
    treeshake: true,
    minify: true,
    keepNames: true,
})