import { expect, test } from "@playwright/test";

/**
 * 外部リンクのアクセシビリティ要件を確認する E2E テスト
 *
 * 各外部リンクに以下が揃っていることを検証する:
 *   - target="_blank"
 *   - rel に "noopener" と "noreferrer" を含む
 *   - ↗ アイコン SVG（aria-hidden="true"）が存在する
 *   - スクリーンリーダー向けテキスト「（新しいタブで開きます）」が存在する
 */

test.describe("ExternalLink アクセシビリティ", () => {
  /**
   * ExternalLink コンポーネントで生成されたリンクの属性・要素を検証するヘルパー
   */
  async function assertExternalLink(
    page: import("@playwright/test").Page,
    locator: import("@playwright/test").Locator,
  ) {
    await expect(locator).toHaveAttribute("target", "_blank");

    const rel = await locator.getAttribute("rel");
    expect(rel).toContain("noopener");
    expect(rel).toContain("noreferrer");

    // ↗ SVG アイコン（aria-hidden）
    await expect(locator.locator("svg[aria-hidden='true']")).toBeVisible();

    // スクリーンリーダー向けテキスト
    await expect(locator.locator(".sr-only")).toContainText("新しいタブで開きます");
  }

  test.describe("about ページ（DB 不要）", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/about");
    });

    test("経験欄の外部リンクがアクセシビリティ要件を満たす", async ({ page }) => {
      // kute-fes.com へのリンク（aboutContent.ts にハードコード済み）
      const link = page.locator(`a[href="https://www.kute-fes.com/"]`);
      await assertExternalLink(page, link);
    });
  });

  test.describe("works 詳細ページ（D1 シード後）", () => {
    test.beforeEach(async ({ page }) => {
      // globalSetup でシードされた id=9001 の作品を使用（実データと衝突しない高 ID）
      await page.goto("/works/9001");
    });

    test("GitHub リンクがアクセシビリティ要件を満たす", async ({ page }) => {
      const link = page.locator(
        `a[href="https://github.com/example-user/sample"]`,
      );
      await assertExternalLink(page, link);
    });

    test("サイトリンクがアクセシビリティ要件を満たす", async ({ page }) => {
      const link = page.locator(`a[href="https://example.com/"]`);
      await assertExternalLink(page, link);
    });
  });
});
