-- MCP の E2E テスト用シードデータ（べき等）
-- 管理者: admin@example.com / e2e-admin-password（ADMIN_EMAILS 未設定時の既定の管理者）
-- 個人トークン: ptf_e2eTestTokenForLocalAndCiOnly000000000000（id はその SHA-256）
-- いずれもローカルと CI 専用のテスト値で、本番の D1 には入れない。

INSERT OR REPLACE INTO users (id, name, email, password, created_at, updated_at)
VALUES (9001, 'E2E Admin', 'admin@example.com', '$2b$10$eRn5hwBJQ0eNw9QM72mjIeqrGiMZX8a8WkDB/7JExp3k066KEe3EC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR REPLACE INTO api_tokens (id, user_id, kind, label, prefix, client_id, scope, audience, created_at, last_used_at, expires_at)
VALUES (
  '88d091ace7b165111e4749d4d8a1b68a7020241675c026a4e4a7ba52e79fa24a',
  9001,
  'personal',
  'E2E',
  'ptf_e2eT',
  NULL,
  'portfolio:read portfolio:write',
  NULL,
  '2026-01-01T00:00:00.000Z',
  NULL,
  NULL
);
