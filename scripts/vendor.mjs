import { copyFileSync, mkdirSync } from "node:fs";
mkdirSync("vendor", { recursive: true });
for (const file of ["three.module.min.js", "three.core.min.js"])
  copyFileSync(`node_modules/three/build/${file}`, `vendor/${file}`);
copyFileSync("node_modules/three/LICENSE", "vendor/THREE-LICENSE.txt");
