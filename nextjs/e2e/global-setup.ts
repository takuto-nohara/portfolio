import { execSync } from "node:child_process";
import path from "node:path";

export default function globalSetup() {
  const root = path.resolve(__dirname, "..");

  // D1 マイグレーション適用（ローカル）
  execSync("npx wrangler d1 migrations apply portfolio-db --local", {
    cwd: root,
    stdio: "inherit",
  });

  // E2E テスト用シードデータ投入（INSERT OR IGNORE でべき等）
  for (const file of ["e2e/fixtures/seed-e2e.sql", "e2e/fixtures/seed-mcp.sql"]) {
    execSync(`npx wrangler d1 execute portfolio-db --local --file=${file}`, {
      cwd: root,
      stdio: "inherit",
    });
  }
}
