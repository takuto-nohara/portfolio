import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reportPath = path.join(process.cwd(), "report/html/jscpd-report.json");

try {
  const data = fs.readFileSync(reportPath, "utf8");
  const report = JSON.parse(data);

  if (report.duplicates) {
    report.duplicates.forEach((duplicate) => {
      console.log("Duplicate found:");
      console.log(
        `- File A: ${duplicate.firstFile.name}:${duplicate.firstFile.start}-${duplicate.firstFile.end}`,
      );
      console.log(
        `- File B: ${duplicate.secondFile.name}:${duplicate.secondFile.start}-${duplicate.secondFile.end}`,
      );
      console.log(`- Lines: ${duplicate.lines}`);
      console.log("---");
    });
  } else {
    console.log("No duplicates found in report structure?");
    console.log(Object.keys(report));
  }
} catch (error) {
  console.error("Error reading report:", error);
  process.exit(1);
}