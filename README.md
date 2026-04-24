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
- **主な機能**: 制作物 CRUD・画像管理・お問い合わせフォーム（Gmail 送信）・管理画面・サイト設定

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
| `/admin/settings` | サイト設定（Gmail 送信設定など） |

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

マイグレーションファイル: `nextjs/worker/migrations/`

---

## ライセンス

このリポジトリのコードは個人ポートフォリオ目的で公開しています。
