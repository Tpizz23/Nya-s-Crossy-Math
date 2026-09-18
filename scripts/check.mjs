import { readdirSync, readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
for (const folder of ["src", "js", "js/scenes", "scripts"])
  for (const file of readdirSync(folder)) {
    if (!/\.m?js$/.test(file)) continue;
    const result = spawnSync(
      process.execPath,
      ["--check", `${folder}/${file}`],
      { encoding: "utf8" },
    );
    if (result.status) {
      console.error(result.stderr);
      process.exit(1);
    }
  }
const html = readFileSync("index.html", "utf8");
for (const [, asset] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  if (asset.startsWith("data:") || asset === "./") continue;
  if (!existsSync(asset)) throw new Error(`Missing local asset: ${asset}`);
}
for (const asset of [
  "vendor/three.module.min.js",
  "vendor/three.core.min.js",
  "vendor/THREE-LICENSE.txt",
])
  if (!existsSync(asset)) throw new Error(`Missing ${asset}`);
console.log("JavaScript syntax and local runtime assets verified.");
