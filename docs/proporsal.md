# ポートフォリオサイト 企画書

## 1. プロジェクト概要

| 項目 | 内容 |
|------|------|
| プロジェクト名 | ポートフォリオサイト |
| 使用技術 | PHP（Laravel）/ クリーンアーキテクチャ |
| 目的 | インターンシップ応募用ポートフォリオ / PHP学習 |
| 公開対象 | インターンシップ先企業・採用担当者 |
| 開発者 | 野原 拓人 |

## 2. 企画背景・目的

### 2.1 背景

インターンシップへの応募にあたり、自身のスキルや制作実績を企業に効果的に伝えるためのポートフォリオサイトが必要となった。既存のポートフォリオサービスではなく、自らフルスクラッチで開発することで、技術力そのものをアピールする。

### 2.2 目的

1. **企業へのアピール** — これまでの制作物（アプリ、Webサイト、動画、パンフレット等）を体系的に整理し、スキルと実績を可視化する
2. **PHP（Laravel）の学習** — 実践的なプロジェクトを通じて、Laravel のルーティング・Blade テンプレート・Eloquent ORM 等を習得する
3. **設計力の証明** — クリーンアーキテクチャを採用し、関心の分離・依存性逆転といった設計原則を PHP で実践する
4. **Web開発の総合力向上** — 設計・実装・デプロイまでを一人で完遂し、開発プロセス全体を経験する

## 3. ターゲットユーザー

- インターンシップ先企業の採用担当者・エンジニア
- 制作実績に興味を持つ開発者・デザイナー

## 4. 掲載コンテンツ

| カテゴリ | 内容例 |
|----------|--------|
| アプリケーション | 開発したWebアプリ・モバイルアプリの紹介（スクリーンショット、技術スタック、GitHub リンク） |
| Webサイト | 制作したWebサイトのスクリーンショット・URL・使用技術 |
| 動画 | 制作した映像作品の埋め込み・サムネイル・概要説明 |
| パンフレット・グラフィック | デザイン制作物の画像・PDF・制作意図 |

## 5. サイト構成（ページ一覧）

```
/ (トップページ)
├── /about          … 自己紹介・スキルセット
├── /works          … 制作物一覧
│   └── /works/{id} … 制作物詳細
├── /contact        … お問い合わせフォーム
└── /admin          … 管理画面（制作物の CRUD）
```

### 5.1 各ページ概要

| ページ | 説明 |
|--------|------|
| トップページ | ファーストビュー・自己紹介の要約・制作物ハイライト |
| About | 自己紹介、スキルセット（言語・フレームワーク・ツール）、経歴 |
| Works 一覧 | 制作物をカテゴリ別（アプリ / Web / 動画 / グラフィック）にフィルタリング表示 |
| Works 詳細 | 制作物の詳細情報（概要・技術スタック・スクリーンショット・リンク） |
| Contact | お問い合わせフォーム（名前・メール・本文） |
| 管理画面 | ログイン認証付き。制作物の追加・編集・削除（CRUD）を行う |

## 6. アーキテクチャ設計

### 6.1 設計思想：クリーンアーキテクチャ

本プロジェクトでは、Laravel のデフォルトの MVC 構成ではなく **クリーンアーキテクチャ** を採用する。
ビジネスロジックをフレームワークから分離することで、テスタビリティ・保守性を高め、設計力をアピールする。

#### レイヤー構成

| レイヤー | 責務 | 実装場所 |
|----------|------|----------|
| **Domain** | エンティティ・値オブジェクト・リポジトリインターフェース | `app/Domain/` |
| **UseCases** | アプリケーションビジネスルール（ユースケース） | `app/UseCases/` |
| **Infrastructure** | 外部依存の実装（Eloquent リポジトリ・メール・ストレージ） | `app/Infrastructure/` |
| **Presentation** | コントローラ・フォームリクエスト・Blade テンプレート | `app/Http/` / `resources/views/` |

#### 依存の方向

```
Presentation → UseCases → Domain ← Infrastructure
```

- 内側のレイヤー（Domain）は外側に依存しない
- Infrastructure は Domain のインターフェースを実装する（依存性逆転の原則）
- Laravel の Service Container（DI コンテナ）でインターフェースと実装をバインドする

#### ディレクトリ構成

```
app/
├── Domain/                      … ドメイン層
│   ├── Entities/
│   │   ├── Work.php             … 制作物エンティティ
│   │   └── Contact.php          … お問い合わせエンティティ
│   ├── ValueObjects/
│   │   └── Category.php         … カテゴリ値オブジェクト
│   └── Repositories/
│       ├── WorkRepositoryInterface.php
│       └── ContactRepositoryInterface.php
│
├── UseCases/                    … ユースケース層
│   ├── Work/
│   │   ├── GetWorkListUseCase.php
│   │   ├── GetWorkDetailUseCase.php
│   │   ├── CreateWorkUseCase.php
│   │   ├── UpdateWorkUseCase.php
│   │   └── DeleteWorkUseCase.php
│   └── Contact/
│       └── SendContactUseCase.php
│
├── Infrastructure/              … インフラストラクチャ層
│   ├── Repositories/
│   │   ├── EloquentWorkRepository.php
│   │   └── EloquentContactRepository.php
│   ├── Mail/
│   └── Storage/
│
├── Http/                        … プレゼンテーション層
│   ├── Controllers/
│   ├── Requests/
│   └── Middleware/
│
├── Models/                      … Eloquent モデル（Infrastructure の一部）
└── Providers/
    └── RepositoryServiceProvider.php  … DI バインディング定義
```

## 7. 技術構成

### 7.1 バックエンド

| 項目 | 技術 |
|------|------|
| 言語 | PHP 8.x |
| フレームワーク | Laravel 11.x |
| Webサーバー | Apache（mod_rewrite 使用） |
| データベース | MySQL / SQLite（開発環境） |
| 認証 | Laravel Breeze（管理画面用） |
| ファイルストレージ | Laravel Storage（画像・PDF のアップロード） |

### 7.2 フロントエンド

| 項目 | 技術 |
|------|------|
| テンプレートエンジン | Blade（HTML ベース） |
| スクリプト | TypeScript（Vite で コンパイル） |
| CSS | Tailwind CSS |
| ビルドツール | Vite |

### 7.3 インフラ・デプロイ

| 項目 | 技術 |
|------|------|
| バージョン管理 | Git / GitHub |
| デプロイ先 | Render（Free プラン） |
| CI | GitHub Actions（lint・テスト） |

### 7.4 デプロイ先の選定

Laravel（PHP）を無料でホスティングできるサービスの比較：

| サービス | 無料枠 | PHP/Laravel対応 | DB | 備考 |
|----------|--------|----------------|-----|------|
| **Render** | ✅ Free Web Service | Docker経由で対応 | PostgreSQL 無料（90日） | ⭐ 推奨。GitHub連携で自動デプロイ可。無操作15分でスリープ（初回アクセス時にコールドスタート約30秒） |
| **Fly.io** | ✅ 3 shared VM まで無料 | Docker経由で対応 | PostgreSQL 無料枠あり | リージョン選択可。設定がやや上級者向け |
| **Koyeb** | ✅ 1 nano instance 無料 | Docker経由で対応 | 外部DBが必要 | グローバルデプロイ。DB は別途用意が必要 |
| **Railway** | ⚠️ トライアル $5分 | ネイティブ対応 | MySQL/PostgreSQL 対応 | セットアップが最も簡単だが、無料枠を超えると課金発生 |
| GitHub Pages | ❌ | 静的サイトのみ（PHP不可） | — | Laravel は動作しない |

**→ 推奨：Render（Free プラン）**

選定理由：
- 完全無料（クレジットカード登録のみ、課金なし）
- GitHub リポジトリと連携し、push 時に自動デプロイ
- Docker（PHP + Apache）を使うため、Laravel の実行環境を柔軟に構築可能
- PostgreSQL データベースも無料で利用可能（90日間。以降は再作成で対応可）
- デプロイ経験そのものがポートフォリオのアピールポイントになる

注意点：
- 無操作15分でインスタンスがスリープし、次のアクセス時に約30秒のコールドスタートが発生する
- 企業に見せる際は事前にアクセスしてウォームアップしておくとよい

## 8. データベース設計（主要テーブル）

### works テーブル

| カラム | 型 | 説明 |
|--------|------|------|
| id | bigint | 主キー |
| title | varchar | 制作物タイトル |
| category | varchar | カテゴリ（app / web / video / graphic） |
| description | text | 概要説明 |
| tech_stack | varchar | 使用技術（カンマ区切り） |
| thumbnail | varchar | サムネイル画像パス |
| url | varchar (nullable) | 外部リンク（サイトURL等） |
| github_url | varchar (nullable) | GitHub リポジトリURL |
| published_at | date (nullable) | 制作・公開日 |
| is_featured | boolean | トップページに表示するか |
| sort_order | integer | 表示順 |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

### work_images テーブル

| カラム | 型 | 説明 |
|--------|------|------|
| id | bigint | 主キー |
| work_id | bigint (FK) | works テーブルへの外部キー |
| image_path | varchar | 画像ファイルパス |
| sort_order | integer | 表示順 |

### contacts テーブル

| カラム | 型 | 説明 |
|--------|------|------|
| id | bigint | 主キー |
| name | varchar | 送信者名 |
| email | varchar | メールアドレス |
| message | text | 本文 |
| created_at | timestamp | 送信日時 |

## 9. 主要機能一覧

| 機能 | 説明 | 学習ポイント |
|------|------|-------------|
| 制作物一覧・詳細表示 | カテゴリフィルタ付きで一覧表示、詳細ページへ遷移 | UseCase・リポジトリパターン・Blade |
| 管理画面 CRUD | 制作物の登録・編集・削除 | フォームバリデーション・ファイルアップロード |
| 画像アップロード | サムネイル・詳細画像の管理 | Laravel Storage・画像リサイズ |
| お問い合わせフォーム | 入力バリデーション・送信完了画面 | FormRequest・メール送信 |
| 認証 | 管理画面へのログイン | Laravel Breeze・ミドルウェア |
| レスポンシブデザイン | PC・タブレット・スマートフォン対応 | Tailwind CSS |

## 10. 開発スケジュール（目安）

| フェーズ | 内容 | 期間 |
|----------|------|------|
| Phase 1 | 環境構築・クリーンアーキテクチャのディレクトリ設計・DB設計・マイグレーション作成 | 1週間 |
| Phase 2 | Domain / UseCase / Infrastructure 層の実装・管理画面 CRUD | 1〜2週間 |
| Phase 3 | フロントエンド（トップ・About・Works 一覧/詳細） | 1〜2週間 |
| Phase 4 | お問い合わせフォーム・メール送信 | 3〜4日 |
| Phase 5 | デザイン調整・レスポンシブ対応 | 1週間 |
| Phase 6 | テスト・デプロイ・公開 | 1週間 |

## 11. 学習ポイント

本プロジェクトを通じて習得を目指す主要概念：

### アーキテクチャ・設計

- **クリーンアーキテクチャ** — レイヤー分離・依存性の方向制御
- **依存性逆転の原則（DIP）** — インターフェースによる実装の抽象化
- **リポジトリパターン** — データアクセスの抽象化
- **Service Container / DI** — Laravel の DI コンテナを活用したバインディング

### Laravel

- **ルーティング** — RESTful なURL設計
- **Blade テンプレート** — レイアウト継承・コンポーネント
- **Eloquent ORM** — モデル定義・リレーション・クエリビルダ
- **マイグレーション・シーダー** — DBスキーマのバージョン管理
- **バリデーション** — FormRequest による入力検証
- **認証・認可** — Breeze / ミドルウェアによるアクセス制御
- **ファイルストレージ** — 画像アップロード・公開ディスク設定
- **メール送信** — Mailable クラスの実装

## 12. 参考・備考

- 企業に見せることを前提に、コードの可読性・コミットメッセージ・README の整備にも注力する
- GitHub リポジトリを公開し、ソースコード自体もポートフォリオの一部として活用する
- デザインはシンプル・クリーンを基調とし、制作物が主役になる構成とする
- クリーンアーキテクチャの採用により、設計力・コードの整理力もアピールポイントとする
