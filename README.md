# ポートフォリオサイト

野原 拓人のポートフォリオサイトです。

---

## 概要

インターンシップ応募に際し、これまでの制作物・スキル・自己紹介を一元的に発信するためにフルスクラッチで開発した個人ポートフォリオサイトです。既存のポートフォリオサービスを使わず自ら実装することで、技術力そのものをアピールすることを意図しています。

本リポジトリには **2 つの独立した実装** が存在します。

### 1. PHP / Laravel 実装（`laravel/`）

**学習・設計実践を目的とした実装です。**

Laravel を初めて本格的に扱うにあたり、チュートリアル的な MVC 構成にとどまらず、最初から **クリーンアーキテクチャ** を採用しました。ビジネスロジックをフレームワークから切り離すことで、関心の分離・依存性逆転・テスタビリティといった設計原則を PHP で実践しています。

- **技術**: PHP 8.3 / Laravel 13 / Blade / Tailwind CSS / SQLite
- **設計**: クリーンアーキテクチャ（Domain / UseCases / Infrastructure / Presentation）
- **認証**: Laravel Breeze ベースの管理画面ログイン
- **主な機能**: 制作物 CRUD・画像管理・お問い合わせフォーム（メール送信）・管理画面

Laravel の学習ログとして、1 ステップ 1 コミットを意識して開発を進めており、Git の履歴自体が学習記録になっています。

```
laravel/app/
├── Domain/           … エンティティ・値オブジェクト・リポジトリインターフェース
├── UseCases/         … アプリケーションビジネスルール
├── Infrastructure/   … Eloquent リポジトリ・メール・ストレージの具象実装
└── Http/             … コントローラ・フォームリクエスト（プレゼンテーション層）
```

依存の方向: `Http → UseCases → Domain ← Infrastructure`

### 2. Next.js 実装（`nextjs/`）

**本番稼働している実装です。**

Laravel 実装の開発中に Railway との 連携が動作しないという問題に直面し、同一のアーキテクチャ思想を TypeScript / Next.js で再実装しました。クリーンアーキテクチャの層構成・インターフェースによる依存逆転・ユースケース設計を TypeScript で忠実に再現しています。

- **技術**: Next.js 16.2 / React 19.2 / TypeScript / Tailwind CSS v4
- **デプロイ**: Cloudflare Workers（OpenNext.js）
- **データベース**: Cloudflare D1（SQLite）
- **ストレージ**: Cloudflare R2（制作物画像）
- **認証**: JWT（jose）/ bcryptjs による管理者セッション + Google OAuth（Gmail 送信用）
- **主な機能**: 制作物 CRUD・画像管理・お問い合わせフォーム（Gmail 送信）・管理画面・サイト設定・MCP サーバー（AI ツールからの管理）

```
nextjs/src/app/
├── domain/           … エンティティ・リポジトリインターフェース
├── application/      … ユースケース層
├── infrastructure/   … D1 / R2 / Gmail などの外部依存実装
└── (presentation)/   … ページ・コンポーネント（Next.js App Router）
```

依存の方向: `presentation → application → domain ← infrastructure`

---

## リポジトリ構成

```
portfolio/
├── laravel/    … PHP / Laravel 実装（クリーンアーキテクチャ学習）
├── nextjs/     … Next.js 実装（本番・Cloudflare Workers デプロイ）
└── docs/       … 企画書・実装計画・デザインファイル
```

---

## ページ構成（両実装共通）

| パス | 説明 |
|------|------|
| `/` | トップページ（注目制作物のハイライト） |
| `/about` | 自己紹介・スキルセット |
| `/works` | 制作物一覧（カテゴリフィルタ対応） |
| `/works/{id}` | 制作物詳細 |
| `/contact` | お問い合わせフォーム |
| `/login` | 管理者ログイン |
| `/admin/works` | 制作物 CRUD 管理画面 |
| `/admin/contacts` | お問い合わせ一覧 |
| `/admin/settings` | サイト設定（Gmail 送信設定・MCP 連携など） |
| `/oauth/consent` | MCP の OAuth 同意画面（Next.js 実装のみ） |

---

## データベーススキーマ（Next.js 実装 / Cloudflare D1）

| テーブル | 説明 |
|----------|------|
| `works` | 制作物（タイトル・カテゴリ・技術スタック・URL など） |
| `work_images` | 制作物に紐づく画像 |
| `contacts` | お問い合わせ |
| `users` | 管理者アカウント |
| `settings` | サイト設定（key-value） |
| `oauth_tokens` | OAuth トークン（Gmail 送信用） |
| `api_tokens` | MCP のアクセストークン（個人トークンと OAuth。平文は保存せず SHA-256 のみ） |
| `oauth_clients` / `oauth_codes` / `oauth_refresh_tokens` | MCP 用 OAuth 2.1 のクライアント・認可コード・リフレッシュトークン |

マイグレーションファイル: `nextjs/worker/migrations/`

---

## AI ツールから管理する（MCP）

Next.js 実装は MCP（Model Context Protocol）サーバーを持ち、ChatGPT・Claude・dots などの AI ツールから管理画面と同じ操作ができます。

- **エンドポイント**: `https://<サイトのドメイン>/api/mcp`（ステートレスな JSON-RPC over POST。SSE・セッションなし）
- **できること**: 作品の登録・更新・削除、注目作品の切り替え、サムネイル・ギャラリー画像（https の URL か base64、PNG / JPEG / GIF / WebP / AVIF・10MB まで）、制作区分の追加・更新・削除、お問い合わせの閲覧・削除、サイト設定の参照・更新
- **できないこと**: Google アカウントの連携（ブラウザでのリダイレクトが必要なため管理画面から行う）、プロフィール・スキル・経歴の編集（コード内の固定値。参照のみ）
- **認証**: Bearer トークンのみ。スコープは `portfolio:read`（参照）と `portfolio:write`（変更）

### 接続方法

| クライアント | 方法 |
|--------------|------|
| ChatGPT | 設定 → アプリとコネクタ → 開発者モードを有効にし、コネクタを作成。URL に `/api/mcp` を入れ、認証は OAuth。管理者アカウントでログインして同意します |
| Claude（claude.ai / Claude Desktop） | 設定 → コネクタ → カスタムコネクタを追加。URL に `/api/mcp` を入れると OAuth の同意画面が開きます |
| Claude Code | 管理画面「サイト設定 → MCP 連携」で個人トークンを発行し、`claude mcp add --transport http portfolio https://<ドメイン>/api/mcp --header "Authorization: Bearer ptf_..."` |
| dots などその他 | URL と `Authorization: Bearer <個人トークン>` ヘッダを設定します。OAuth（動的クライアント登録 + PKCE）に対応したクライアントならトークンなしで接続できます |

個人トークンと OAuth の接続は、どちらも「サイト設定 → MCP 連携」から失効できます。

### 実装

- `nextjs/worker/lib/mcp/` … JSON-RPC の処理とツール定義（`tools-read.ts` / `tools-works.ts` / `tools-site.ts`）
- `nextjs/worker/lib/mcp-auth/` … 個人トークンと OAuth 2.1 認可サーバー（RFC 9728 / 8414 / 7591 / 7009、PKCE S256、リフレッシュトークンの回転）
- 管理操作は `application/usecases/admin/` のサービスに集約し、管理画面のフォームと MCP ツールの両方から使っています
- テスト: `npm run test:unit`（Vitest）、`npm run test:e2e`（Playwright。`e2e/mcp.spec.ts`）

---

## ライセンス

このリポジトリのコードは個人ポートフォリオ目的で公開しています。
