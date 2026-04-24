import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDirs = [path.join(__dirname, "../src")];
const MAX_LINES = 500;

const excludePatterns = [
  /node_modules/,
  /dist/,
  /build/,
  /\.next/,
  /\.open-next/,
  /\.wrangler/,
  /\.test\.(ts|tsx|js)$/,
  /\.spec\.(ts|tsx|js)$/,
  /\.config\.(ts|js|mjs)$/,
];

function shouldExclude(filePath) {
  return excludePatterns.some((pattern) => pattern.test(filePath));
}

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if ((file.endsWith(".ts") || file.endsWith(".tsx")) && !shouldExclude(filePath)) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const files = targetDirs.flatMap((dir) => getAllFiles(dir));
const violations = [];

files.forEach((file) => {
  const content = fs.readFileSync(file, "utf-8");
  const lines = content.split("\n");
  const lineCount = content === "" ? 0 : lines.at(-1) === "" ? lines.length - 1 : lines.length;

  if (lineCount > MAX_LINES) {
    const relativePath = path.relative(process.cwd(), file).replace(/\\/g, "/");
    violations.push({
      file: relativePath,
      lines: lineCount,
      excess: lineCount - MAX_LINES,
    });
  }
});

if (violations.length > 0) {
  console.error(`\nFound ${violations.length} file(s) exceeding ${MAX_LINES} lines:\n`);
  violations.forEach((violation) => {
    console.error(
      `  ${violation.file}: ${violation.lines} lines (${violation.excess} lines over limit)`,
    );
  });
  console.error(`\nPlease refactor these files to be under ${MAX_LINES} lines each.`);
  process.exit(1);
}

console.log(`All files are within the ${MAX_LINES} line limit.`);