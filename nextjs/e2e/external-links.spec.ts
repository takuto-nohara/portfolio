import { expect, test } from "@playwright/test";

/**
 * 外部リンクのアクセシビリティ要件を確認する E2E テスト
 *
 * ルール:
 *   - GitHub など外部サービスへのリンク → ExternalLink（新しいタブ・アイコン・SR テキスト・ツールチップ）
 *   - 他のウェブサイト（ポートフォリオ等）→ 通常 <a>（同タブ・新タブ属性なし）
 */

test.describe("外部リンク動作確認", () => {
  /**
   * ExternalLink コンポーネントで生成されたリンクの属性・要素を検証するヘルパー
   */
  async function assertExternalLink(
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

    // ホバー時ツールチップ（role="tooltip"）が存在する
    const tooltip = locator.locator("span[role='tooltip']");
    await expect(tooltip).toContainText("新しいタブで開きます");
  }

  /**
   * 通常リンク（同タブ）の検証ヘルパー
   */
  async function assertSameTabLink(locator: import("@playwright/test").Locator) {
    // target="_blank" が設定されていないことを確認
    await expect(locator).not.toHaveAttribute("target", "_blank");
    // リンク自体が存在・表示されていることを確認
    await expect(locator).toBeVisible();
  }

  test.describe("about ページ（DB 不要）", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/about");
    });

    test("経験欄の外部リンクは同タブで開く", async ({ page }) => {
      // kute-fes.com へのリンク（aboutContent.ts にハードコード済み）→ 同タブ
      const link = page.locator(`a[href="https://www.kute-fes.com/"]`);
      await assertSameTabLink(link);
    });
  });

  test.describe("works 詳細ページ（D1 シード後）", () => {
    test.beforeEach(async ({ page }) => {
      // globalSetup でシードされた id=9001 の作品を使用（実データと衝突しない高 ID）
      await page.goto("/works/9001");
    });

    test("GitHub リンクが新しいタブで開くアクセシビリティ要件を満たす", async ({ page }) => {
      const link = page.locator(
        `a[href="https://github.com/example-user/sample"]`,
      );
      await assertExternalLink(link);
    });

    test("サイトリンクは同タブで開く", async ({ page }) => {
      const link = page.locator(`a[href="https://example.com/"]`);
      await assertSameTabLink(link);
    });
  });
});
