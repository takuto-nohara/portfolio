-- MCP（AI ツール連携）の認証。
-- api_tokens は個人トークンと OAuth のアクセストークンの両方を持つ。id はトークン平文の SHA-256（平文は保存しない）。
CREATE TABLE IF NOT EXISTS api_tokens (
  id           TEXT PRIMARY KEY NOT NULL,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind         TEXT NOT NULL,
  label        TEXT NOT NULL,
  prefix       TEXT NOT NULL,
  client_id    TEXT,
  scope        TEXT NOT NULL,
  audience     TEXT,
  created_at   TEXT NOT NULL,
  last_used_at TEXT,
  expires_at   TEXT
);

CREATE INDEX IF NOT EXISTS idx_api_tokens_user_id ON api_tokens(user_id);

-- 動的クライアント登録（RFC 7591）と Client ID Metadata Document で知ったクライアント。
-- fetched_at は登録・文書の取得・認可の開始のたびに更新し、使われていないクライアントの片付けに使う
CREATE TABLE IF NOT EXISTS oauth_clients (
  client_id          TEXT PRIMARY KEY NOT NULL,
  client_name        TEXT NOT NULL,
  redirect_uris_json TEXT NOT NULL,
  source             TEXT NOT NULL,
  fetched_at         TEXT NOT NULL
);

-- 認可コード。id はコード平文の SHA-256
CREATE TABLE IF NOT EXISTS oauth_codes (
  id             TEXT PRIMARY KEY NOT NULL,
  client_id      TEXT NOT NULL,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  redirect_uri   TEXT NOT NULL,
  code_challenge TEXT NOT NULL,
  scope          TEXT NOT NULL,
  audience       TEXT,
  expires_at     TEXT NOT NULL
);

-- リフレッシュトークン。回転するたびに同じ family_id で新しい行を作り、使い回しを見つけたら family ごと消す
CREATE TABLE IF NOT EXISTS oauth_refresh_tokens (
  id              TEXT PRIMARY KEY NOT NULL,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id       TEXT NOT NULL,
  family_id       TEXT NOT NULL,
  scope           TEXT NOT NULL,
  audience        TEXT,
  access_token_id TEXT NOT NULL,
  expires_at      TEXT NOT NULL,
  used_at         TEXT
);

CREATE INDEX IF NOT EXISTS idx_oauth_refresh_tokens_family_id ON oauth_refresh_tokens(family_id);
CREATE INDEX IF NOT EXISTS idx_oauth_refresh_tokens_access_token_id ON oauth_refresh_tokens(access_token_id);
