import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");

const requiredFiles = [
  ".jscpd.json",
  "dependency-cruiser.config.mjs",
  "knip.json",
  "wrangler.toml",
  "open-next.config.ts",
  "scripts/ci.js",
  "scripts/analyze_deps.js",
  "scripts/check-file-lines.js",
  "scripts/check-api.js",
  "scripts/check-sync.js",
];

const requiredScripts = [
  "build",
  "lint",
  "check:layers",
  "check:dup",
  "check:lines",
  "check:api",
  "check:sync",
  "knip",
  "ci",
  "preview",
  "deploy",
  "upload",
  "cf-typegen",
];

const missingFiles = requiredFiles.filter(
  (relativePath) => !fs.existsSync(path.join(projectRoot, relativePath)),
);

if (missingFiles.length > 0) {
  console.error("Missing required project files:");
  missingFiles.forEach((relativePath) => console.error(`  ${relativePath}`));
  process.exit(1);
}

const packageJsonPath = path.join(projectRoot, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const scripts = packageJson.scripts ?? {};
const missingScripts = requiredScripts.filter((scriptName) => !(scriptName in scripts));

if (missingScripts.length > 0) {
  console.error("Missing required package scripts:");
  missingScripts.forEach((scriptName) => console.error(`  ${scriptName}`));
  process.exit(1);
}

const wranglerToml = fs.readFileSync(path.join(projectRoot, "wrangler.toml"), "utf8");
const requiredBindings = ['binding = "DB"', 'binding = "R2_BUCKET"'];
const missingBindings = requiredBindings.filter((binding) => !wranglerToml.includes(binding));

if (missingBindings.length > 0) {
  console.error("wrangler.toml is missing required bindings:");
  missingBindings.forEach((binding) => console.error(`  ${binding}`));
  process.exit(1);
}

console.log("Project sync check passed.");