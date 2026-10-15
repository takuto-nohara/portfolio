import { defineConfig, devices } from "@playwright/test";

// E2E_BASE_URL を指定すると、起動済みのサーバー（別ポートの preview など）に対して実行する
const externalBaseUrl = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: externalBaseUrl ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: externalBaseUrl
    ? undefined
    : {
        // CI では opennextjs-cloudflare build 済みの成果物を wrangler dev で起動する。
        // next dev は getPlatformProxy() 経由の D1 バインディングが CI 環境で
        // 不安定なため、実際の Cloudflare Workers ランタイムを使う preview を使用する。
        command: process.env.CI ? "npx opennextjs-cloudflare preview" : "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});
