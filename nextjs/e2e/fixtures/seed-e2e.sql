-- E2E テスト用シードデータ（べき等 — INSERT OR REPLACE）
-- id=9001 は実際のデータと衝突しない高い値を使用

INSERT OR REPLACE INTO settings (key, value, created_at, updated_at)
VALUES ('githubUrl', 'https://github.com/example-user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

DELETE FROM works WHERE id = 9001;

INSERT INTO works (id, title, category, description, tech_stack, github_url, url, is_featured, sort_order, created_at, updated_at)
VALUES (
  9001,
  'E2E テスト用サンプル作品',
  'web',
  'E2E テスト用のサンプル作品です。',
  '["Next.js","TypeScript"]',
  'https://github.com/example-user/sample',
  'https://example.com/',
  1,
  9001,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
