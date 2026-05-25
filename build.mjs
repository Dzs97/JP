// Transpile src/*.jsx → src-compiled/*.js (IIFE-wrapped, JSX stripped).
// Pure transform — no bundling. Each output file is independent and still
// loaded as its own <script> in index.html.

import * as esbuild from "esbuild";
import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const SRC = "src";
const OUT = "src-compiled";

const transformOpts = {
  loader: "jsx",
  jsx: "transform",
  jsxFactory: "React.createElement",
  jsxFragment: "React.Fragment",
  target: "es2020",
};

async function buildOne(file) {
  const code = await readFile(join(SRC, file), "utf8");
  const { code: out } = await esbuild.transform(code, transformOpts);
  const wrapped = `(function(){\n${out}})();\n`;
  const target = join(OUT, file.replace(/\.jsx$/, ".js"));
  await writeFile(target, wrapped);
  return target;
}

async function buildAll() {
  await mkdir(OUT, { recursive: true });
  const files = (await readdir(SRC)).filter((f) => f.endsWith(".jsx"));
  const t0 = Date.now();
  await Promise.all(files.map(buildOne));
  console.log(`✓ built ${files.length} files in ${Date.now() - t0}ms`);
}

await buildAll();

if (process.argv.includes("--watch")) {
  const { default: chokidar } = await import("chokidar");
  console.log("watching src/*.jsx ...");
  chokidar.watch(`${SRC}/*.jsx`).on("change", async (path) => {
    const file = path.split("/").pop();
    try {
      const t0 = Date.now();
      await buildOne(file);
      console.log(`✓ ${file} (${Date.now() - t0}ms)`);
    } catch (e) {
      console.error(`✗ ${file}: ${e.message}`);
    }
  });
}
