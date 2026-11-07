import { copyFileSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const dest = "dist/styles/agent-reveal.css";
mkdirSync(dirname(dest), { recursive: true });
copyFileSync("src/styles/agent-reveal.css", dest);

// Side-effect CSS imports stay in the JS. They must not stay in .d.ts,
// or a consumer typecheck looks for a CSS module it does not have.
function stripCssImports(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      stripCssImports(path);
      continue;
    }
    if (!name.endsWith(".d.ts")) continue;
    const next = readFileSync(path, "utf8").replace(/^import\s+["'][^"']+\.css["'];\r?\n/gm, "");
    writeFileSync(path, next);
  }
}
stripCssImports("dist");
