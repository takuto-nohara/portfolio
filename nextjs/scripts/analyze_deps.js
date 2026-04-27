import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getAllFiles } from "./file-utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, "../src");

const layers = {
  domain: ["application", "infrastructure", "presentation"],
  application: ["infrastructure", "presentation"],
  infrastructure: ["presentation"],
  presentation: [],
};

const files = getAllFiles(srcDir);
let violations = 0;

files.forEach((file) => {
  const content = fs.readFileSync(file, "utf-8");
  const relativePath = path.relative(srcDir, file).replace(/\\/g, "/");
  const currentLayer = relativePath.split("/")[0];

  if (!layers[currentLayer]) {
    return;
  }

  const forbiddenLayers = layers[currentLayer];
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    if (!line.trim().startsWith("import")) {
      return;
    }

    const match = line.match(/from ["'](.+)["']/);
    if (!match) {
      return;
    }

    const importPath = match[1];
    if (!importPath.startsWith(".")) {
      return;
    }

    const absoluteImportPath = path.resolve(path.dirname(file), importPath);
    const relativeImportPath = path.relative(srcDir, absoluteImportPath).replace(/\\/g, "/");
    const resolvedLayer = relativeImportPath.split("/")[0];

    if (forbiddenLayers.includes(resolvedLayer)) {
      console.error(
        `Violation in ${relativePath}:${index + 1}: ${currentLayer} layer imports from ${resolvedLayer} layer (${importPath})`,
      );
      violations += 1;
    }
  });
});

if (violations > 0) {
  console.log(`Found ${violations} violations.`);
  process.exit(1);
}

console.log("No layer violations found.");