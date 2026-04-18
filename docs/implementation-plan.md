# ポートフォリオサイト 実装計画

> **前提**: 本プロジェクトは **PHP（Laravel）の演習教材** としての役割を持つ。  
> 各ステップでは「何を学ぶか」を明示し、段階的に Laravel・クリーンアーキテクチャの概念を習得する構成とする。

---

## 実装方針

### 教材としての設計指針

1. **段階的な難易度** — 基礎（ルーティング・Blade）→ 応用（クリーンアーキテクチャ・DI）の順に進める
2. **動くものを早く作る** — 最初は Laravel のデフォルト MVC で動作確認し、その後クリーンアーキテクチャにリファクタリングする。こうすることで「なぜ設計パターンが必要か」を体感できる
3. **1ステップ1コミット** — 各ステップ完了時にコミットし、Git の履歴自体が学習ログになるようにする
4. **テスト駆動の意識** — ユースケース層からテストを書き、クリーンアーキテクチャのテスタビリティを実感する

---

## Phase 1: 環境構築・プロジェクト基盤（Week 1）

### Step 1-1: Laravel プロジェクト作成
- **やること**: `composer create-project laravel/laravel` でプロジェクト生成
- **学習ポイント**: Composer によるパッケージ管理、Laravel のディレクトリ構成の理解
- **成果物**: Laravel の Welcome ページがブラウザで表示される

### Step 1-2: 開発環境の整備
- **やること**:
  - `.env` の設定（DB接続：SQLite で開発）
  - Vite + Tailwind CSS のセットアップ
  - TypeScript の導入（`vite.config.ts`）
- **学習ポイント**: `.env` による環境変数管理、フロントエンドビルドパイプライン
- **成果物**: `npm run dev` で Vite の開発サーバーが起動する

### Step 1-3: データベース設計・マイグレーション
- **やること**:
  - `works` テーブルのマイグレーション作成
  - `work_images` テーブルのマイグレーション作成
  - `contacts` テーブルのマイグレーション作成
  - `php artisan migrate` で実行
- **学習ポイント**: マイグレーションによるスキーマ管理、カラム型の選択、外部キー制約
- **成果物**: 3テーブルが作成される

```bash
php artisan make:migration create_works_table
php artisan make:migration create_work_images_table
php artisan make:migration create_contacts_table
```

### Step 1-4: クリーンアーキテクチャのディレクトリ作成
- **やること**: 企画書 §6.1 に基づき空ディレクトリ構成を作成
- **学習ポイント**: レイヤードアーキテクチャの概念、各層の責務の理解（コードを書く前にまず構造を理解する）
- **成果物**: `app/Domain/`, `app/UseCases/`, `app/Infrastructure/` ディレクトリが存在する

```
app/
├── Domain/
│   ├── Entities/
│   ├── ValueObjects/
│   └── Repositories/
├── UseCases/
│   ├── Work/
│   └── Contact/
├── Infrastructure/
│   ├── Repositories/
│   ├── Mail/
│   └── Storage/
```

---

## Phase 2: Domain 層 → まず「型」を作る（Week 2）

> **学習テーマ**: PHP のクラス・インターフェース・型の基礎

### Step 2-1: Entity — `Work` エンティティ
- **やること**: `app/Domain/Entities/Work.php` を作成
- **学習ポイント**: 
  - PHP のクラス定義、コンストラクタ、プロパティ
  - `readonly` プロパティ（PHP 8.x）
  - エンティティとは何か（識別子を持つドメインオブジェクト）
- **ポイント**: Eloquent Model とは別物であることを意識する

```php
// 学習ポイント: PHP 8 のコンストラクタプロモーション
final class Work
{
    public function __construct(
        public readonly ?int $id,
        public readonly string $title,
        public readonly Category $category,
        public readonly string $description,
        // ...
    ) {}
}
```

### Step 2-2: ValueObject — `Category` 値オブジェクト
- **やること**: `app/Domain/ValueObjects/Category.php` を作成
- **学習ポイント**:
  - PHP の `enum`（PHP 8.1+）
  - 値オブジェクトとエンティティの違い
  - 型安全なカテゴリ表現（文字列ではなく enum で制約する）

```php
// 学習ポイント: PHP 8.1 の Backed Enum
enum Category: string
{
    case App = 'app';
    case Web = 'web';
    case Video = 'video';
    case Graphic = 'graphic';
}
```

### Step 2-3: Entity — `Contact` エンティティ
- **やること**: `app/Domain/Entities/Contact.php` を作成
- **学習ポイント**: Step 2-1 の復習・定着

### Step 2-4: Repository インターフェース
- **やること**: 
  - `app/Domain/Repositories/WorkRepositoryInterface.php`
  - `app/Domain/Repositories/ContactRepositoryInterface.php`
- **学習ポイント**:
  - PHP のインターフェース（`interface`）
  - 依存性逆転の原則 — 「Domain 層がインターフェースを定義し、Infrastructure 層が実装する」
  - なぜインターフェースを使うのか（テスタビリティ・差し替え可能性）

```php
// 学習ポイント: インターフェースによる抽象化
interface WorkRepositoryInterface
{
    /** @return Work[] */
    public function findAll(): array;
    public function findById(int $id): ?Work;
    public function findByCategory(Category $category): array;
    public function findFeatured(): array;
    public function save(Work $work): Work;
    public function delete(int $id): void;
}
```

---

## Phase 3: Infrastructure 層 — Eloquent で実装する（Week 2〜3）

> **学習テーマ**: Eloquent ORM、リポジトリパターンの実装

### Step 3-1: Eloquent モデル作成
- **やること**:
  - `php artisan make:model Work`
  - `php artisan make:model WorkImage`
  - `php artisan make:model Contact`
  - `$fillable`, `$casts`, リレーション定義
- **学習ポイント**: 
  - Eloquent のモデル定義
  - `$fillable` によるマスアサインメント保護
  - `$casts` による型変換
  - `hasMany` / `belongsTo` リレーション

### Step 3-2: Eloquent リポジトリ実装
- **やること**:
  - `app/Infrastructure/Repositories/EloquentWorkRepository.php`
  - `app/Infrastructure/Repositories/EloquentContactRepository.php`
- **学習ポイント**:
  - インターフェースの `implements`
  - Eloquent モデル ↔ ドメインエンティティの変換（マッピング）
  - クエリビルダの使い方（`where`, `orderBy` 等）
  - **なぜ変換が必要か** — ドメイン層が Eloquent に依存しないようにするため

```php
// 学習ポイント: インターフェースの実装と Eloquent の活用
class EloquentWorkRepository implements WorkRepositoryInterface
{
    public function findAll(): array
    {
        return WorkModel::orderBy('sort_order')
            ->get()
            ->map(fn ($model) => $this->toEntity($model))
            ->toArray();
    }

    private function toEntity(WorkModel $model): Work
    {
        return new Work(
            id: $model->id,
            title: $model->title,
            category: Category::from($model->category),
            // ...
        );
    }
}
```

### Step 3-3: DI バインディング（ServiceProvider）
- **やること**: `app/Providers/RepositoryServiceProvider.php` を作成し、インターフェースと実装をバインド
- **学習ポイント**:
  - Laravel の Service Container（DI コンテナ）
  - `$this->app->bind()` の仕組み
  - なぜ DI が必要か — コントローラがインターフェースだけに依存し、実装を差し替え可能にする

```php
// 学習ポイント: Laravel の DI コンテナ
class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            WorkRepositoryInterface::class,
            EloquentWorkRepository::class
        );
        $this->app->bind(
            ContactRepositoryInterface::class,
            EloquentContactRepository::class
        );
    }
}
```

### Step 3-4: シーダーでテストデータ投入
- **やること**: `database/seeders/WorkSeeder.php` を作成
- **学習ポイント**: シーダーの仕組み、ファクトリパターン
- **成果物**: `php artisan db:seed` でサンプル制作物データが投入される

---

## Phase 4: UseCase 層 — ビジネスロジックの分離（Week 3）

> **学習テーマ**: ユースケースパターン、単一責任の原則

### Step 4-1: Work 関連ユースケース
- **やること**:
  - `GetWorkListUseCase.php` — 一覧取得（カテゴリフィルタ対応）
  - `GetWorkDetailUseCase.php` — 詳細取得
- **学習ポイント**:
  - コンストラクタインジェクション（リポジトリの注入）
  - 1クラス1責務の設計
  - ユースケースの入力（リクエスト）と出力（レスポンス）を明確にする

```php
// 学習ポイント: ユースケースの構造
class GetWorkListUseCase
{
    public function __construct(
        private readonly WorkRepositoryInterface $workRepository
    ) {}

    /** @return Work[] */
    public function execute(?Category $category = null): array
    {
        if ($category !== null) {
            return $this->workRepository->findByCategory($category);
        }
        return $this->workRepository->findAll();
    }
}
```

### Step 4-2: Work CRUD ユースケース
- **やること**:
  - `CreateWorkUseCase.php`
  - `UpdateWorkUseCase.php`
  - `DeleteWorkUseCase.php`
- **学習ポイント**: 
  - DTO（Data Transfer Object）の活用を検討
  - バリデーションはどの層で行うべきか（→ Presentation 層の FormRequest）

### Step 4-3: Contact ユースケース
- **やること**: `SendContactUseCase.php`
- **学習ポイント**: メール送信ロジックの分離

### Step 4-4: ユースケースのユニットテスト
- **やること**: `tests/Unit/UseCases/` にテストを作成
- **学習ポイント**:
  - PHPUnit の基本
  - モック（インターフェースのモック）を使ったテスト
  - **クリーンアーキテクチャの恩恵を実感** — DB なしでビジネスロジックをテストできる

```php
// 学習ポイント: インターフェースのモックによるテスト
public function test_制作物一覧をカテゴリでフィルタできる(): void
{
    $mockRepo = $this->createMock(WorkRepositoryInterface::class);
    $mockRepo->method('findByCategory')
        ->with(Category::App)
        ->willReturn([/* テストデータ */]);

    $useCase = new GetWorkListUseCase($mockRepo);
    $result = $useCase->execute(Category::App);

    $this->assertCount(2, $result);
}
```

---

## Phase 5: Presentation 層 — 公開ページ（Week 3〜4）

> **学習テーマ**: ルーティング、コントローラ、Blade テンプレート、Tailwind CSS

### Step 5-1: レイアウト・共通テンプレート
- **やること**:
  - `resources/views/layouts/app.blade.php` — 共通レイアウト
  - ナビゲーション・フッターのコンポーネント化
- **学習ポイント**: 
  - Blade の `@extends`, `@section`, `@yield`
  - Blade コンポーネント（`<x-navigation />`）
  - Tailwind CSS のユーティリティクラス

### Step 5-2: トップページ
- **やること**:
  - ルート定義: `Route::get('/', [HomeController::class, 'index'])`
  - `HomeController` — `GetWorkListUseCase`（featured のみ）を呼び出す
  - Blade テンプレート: ファーストビュー + 制作物ハイライト
- **学習ポイント**: 
  - ルーティングの基礎
  - コントローラからユースケースへの委譲
  - Blade での変数展開 `{{ $variable }}`

### Step 5-3: About ページ
- **やること**:
  - ルート定義 + コントローラ + Blade
  - スキルセットの表示（言語・フレームワーク・ツール）
- **学習ポイント**: 静的ページの構成、Blade コンポーネントの活用

### Step 5-4: Works 一覧ページ
- **やること**:
  - ルート定義: `Route::get('/works', [WorkController::class, 'index'])`
  - カテゴリフィルタ機能（クエリパラメータ `?category=app`）
  - カード型レイアウトで制作物を表示
- **学習ポイント**: 
  - クエリパラメータの取得（`$request->query('category')`）
  - `@foreach` による繰り返し表示
  - Tailwind CSS の Grid レイアウト

### Step 5-5: Works 詳細ページ
- **やること**:
  - ルート定義: `Route::get('/works/{id}', [WorkController::class, 'show'])`
  - 詳細情報表示（概要・技術スタック・スクリーンショット・リンク）
- **学習ポイント**: 
  - ルートパラメータ（`{id}`）
  - 404 ハンドリング（存在しない制作物へのアクセス）

### Step 5-6: Contact ページ
- **やること**:
  - お問い合わせフォーム（name, email, message）
  - `FormRequest` によるバリデーション
  - 送信完了画面
  - CSRF 対策（`@csrf`）
- **学習ポイント**: 
  - `FormRequest` の作成と使い方
  - バリデーションルール（`required`, `email`, `max`）
  - `@error` ディレクティブによるエラー表示
  - CSRF トークンの仕組みと必要性
  - PRG パターン（Post-Redirect-Get）

---

## Phase 6: 管理画面 — 認証 + CRUD（Week 4〜5）

> **学習テーマ**: 認証、ミドルウェア、ファイルアップロード、フォーム操作

### Step 6-1: Laravel Breeze 導入
- **やること**: `composer require laravel/breeze --dev` → `php artisan breeze:install blade`
- **学習ポイント**: 
  - 認証スカフォールド（ログイン・登録・パスワードリセット）
  - ミドルウェア `auth` の仕組み

### Step 6-2: 管理画面ルーティング
- **やること**: `Route::middleware('auth')->prefix('admin')->group(...)` でルート定義
- **学習ポイント**: 
  - ルートグループ
  - ミドルウェアの適用
  - RESTful リソースルート（`Route::resource`）

### Step 6-3: 制作物 CRUD — 一覧・作成
- **やること**:
  - 管理用コントローラ `Admin/WorkController`
  - 制作物一覧表示（テーブル形式）
  - 新規作成フォーム + バリデーション + 保存
- **学習ポイント**: 
  - `CreateWorkUseCase` への委譲
  - ファイルアップロード（サムネイル画像）
  - `Laravel Storage` の `store()` メソッド
  - `public` ディスクとシンボリックリンク

### Step 6-4: 制作物 CRUD — 編集・削除
- **やること**:
  - 編集フォーム（既存データの表示）+ 更新処理
  - 削除処理（確認ダイアログ）
  - 画像の差し替え・削除
- **学習ポイント**: 
  - `UpdateWorkUseCase`, `DeleteWorkUseCase` への委譲
  - `@method('PUT')`, `@method('DELETE')` — HTML フォームでの HTTP メソッド偽装
  - 古いファイルの削除処理

### Step 6-5: 制作物画像の複数アップロード
- **やること**: `work_images` テーブルを使い、詳細画像を複数管理
- **学習ポイント**: 
  - 複数ファイルアップロード
  - リレーションを活用した関連データの保存
  - JavaScript によるプレビュー表示（TypeScript 演習）

---

## Phase 7: メール送信・仕上げ（Week 5）

> **学習テーマ**: Mailable、イベント、デザイン調整

### Step 7-1: お問い合わせメール送信
- **やること**:
  - `php artisan make:mail ContactMail`
  - `SendContactUseCase` にメール送信ロジックを統合
  - 開発環境では `log` ドライバでメール内容を確認
- **学習ポイント**: 
  - `Mailable` クラスの構造
  - メールドライバの切り替え（`.env` の `MAIL_MAILER`）
  - メールテンプレート（Blade）

### Step 7-2: レスポンシブデザイン
- **やること**: 全ページをモバイル・タブレット・PC で表示確認し調整
- **学習ポイント**: Tailwind CSS のレスポンシブプレフィックス（`sm:`, `md:`, `lg:`）

### Step 7-3: UI/UX ポリッシュ
- **やること**:
  - フラッシュメッセージ（CRUD 操作後の成功/エラー通知）
  - ローディング表示
  - ページ遷移アニメーション（任意）
  - ファビコン・OGP 設定
- **学習ポイント**: `session()->flash()` の使い方、メタタグ

---

## Phase 8: テスト・デプロイ・公開（Week 5〜6）

> **学習テーマ**: テスト戦略、Docker、CI/CD、本番デプロイ

### Step 8-1: Feature テスト
- **やること**: `tests/Feature/` にブラウザテスト的なテストを作成
  - 各ページの HTTP ステータス確認
  - CRUD 操作のテスト
  - 認証が必要なルートのテスト
- **学習ポイント**: Feature テストと Unit テストの違い、`actingAs()` による認証テスト

### Step 8-2: Docker 環境構築
- **やること**:
  - `Dockerfile` 作成（PHP 8.x + Apache + Composer）
  - `.dockerignore` 作成
  - ローカルで `docker build` & `docker run` して動作確認
- **学習ポイント**: Docker の基礎、PHP の本番環境構成

### Step 8-3: GitHub Actions（CI）
- **やること**: `.github/workflows/ci.yml` を作成
  - `composer install` → `php artisan test` を自動実行
  - PHP CS Fixer / Pint によるコードスタイルチェック
- **学習ポイント**: CI パイプラインの基礎、自動テスト

### Step 8-4: Render へデプロイ
- **やること**:
  - Render の Web Service を作成（Docker 環境）
  - 環境変数の設定（`APP_KEY`, DB 接続情報等）
  - PostgreSQL データベースの作成・接続
  - 自動デプロイの設定（GitHub push 連携）
- **学習ポイント**: 本番環境構築、環境変数の管理、データベースの本番設定

### Step 8-5: README・ドキュメント整備
- **やること**:
  - README.md（プロジェクト概要・技術スタック・セットアップ手順・アーキテクチャ図）
  - スクリーンショットの掲載
- **学習ポイント**: 技術ドキュメントの書き方（企業に見せることを意識）

---

## 各ステップの進め方（推奨ワークフロー）

```
1. このドキュメントの該当ステップを読む
2. 学習ポイントに書かれた概念を軽く調べる（公式ドキュメント等）
3. 実装する
4. 動作確認する
5. コミットする（コミットメッセージは日本語 OK、何を学んだか一言添える）
6. 次のステップへ
```

### コミットメッセージ例

```
feat: works テーブルのマイグレーション作成（Schema Builder の学習）
feat: Work エンティティと Category enum を実装（Domain 層の基礎）
feat: EloquentWorkRepository を実装（リポジトリパターンの実践）
feat: GetWorkListUseCase + ユニットテスト（DI によるテスタビリティ）
feat: Works 一覧ページ実装（Blade テンプレート + ルーティング）
```

---

## 依存関係・実装順序の図

```
Step 1 (環境構築)
  ↓
Step 2 (Domain 層: エンティティ・インターフェース)
  ↓
Step 3 (Infrastructure 層: Eloquent 実装 + DI)
  ↓
Step 4 (UseCase 層: ビジネスロジック + テスト)
  ↓
Step 5 (公開ページ: ルーティング・Blade)   ←  ここで初めてブラウザで見える
  ↓
Step 6 (管理画面: 認証 + CRUD)
  ↓
Step 7 (メール・デザイン仕上げ)
  ↓
Step 8 (テスト・デプロイ)
```

> **ポイント**: 内側のレイヤー（Domain → UseCase）から外側（Infrastructure → Presentation）に向かって実装する。  
> これにより、クリーンアーキテクチャの「依存の方向」を身体で覚えられる。
