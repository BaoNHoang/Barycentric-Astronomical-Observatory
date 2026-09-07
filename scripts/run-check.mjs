// Bundling resolves the same @/ imports used by the app, then Node runs the checks.
import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const temporary = await mkdtemp(join(tmpdir(), "bao-check-"));
const file = join(temporary, "check.mjs");
try {
  await build({
    entryPoints: [
      process.argv.includes("--live")
        ? "scripts/check-live.ts"
        : process.argv.includes("--ui")
          ? "scripts/check-interface.tsx"
          : "scripts/check-science.ts",
    ],
    bundle: true,
    platform: "node",
    format: "esm",
    // React's server renderer still loads a few Node built-ins with require().
    banner: {
      js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);',
    },
    jsx: "automatic",
    loader: { ".css": "empty" },
    outfile: file,
  });
  await import(pathToFileURL(file).href);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
