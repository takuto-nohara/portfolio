import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appApiDir = path.join(__dirname, "../src/app/api");
const legacyPagesApiDir = path.join(__dirname, "../pages/api");

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  for (const entry of fs.readdirSync(dir)) {
    const entryPath = path.join(dir, entry);
    if (fs.statSync(entryPath).isDirectory()) {
      walk(entryPath, files);
    } else {
      files.push(entryPath);
    }
  }

  return files;
}

if (fs.existsSync(legacyPagesApiDir)) {
  console.error("Legacy pages/api directory is not allowed. Use src/app/api/**/route.ts instead.");
  process.exit(1);
}

const apiFiles = walk(appApiDir);
const invalidFiles = apiFiles.filter((filePath) => {
  const fileName = path.basename(filePath);
  return fileName !== "route.ts" && fileName !== "route.tsx";
});

if (invalidFiles.length > 0) {
  console.error("Invalid API file names detected:");
  invalidFiles.forEach((filePath) => {
    console.error(`  ${path.relative(process.cwd(), filePath).replace(/\\/g, "/")}`);
  });
  process.exit(1);
}

console.log(`API structure check passed. Found ${apiFiles.length} route file(s).`);