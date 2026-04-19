{{--
    ============================================================
    📄 About ページ
    ============================================================
    design.pen の About Page デザインを模倣しています。
    Hero → Bio → Skills → Experience の構成です。
--}}

@extends('layouts.app')
@section('title', 'About - TN_ Portfolio')

@section('content')

    {{-- ==================== Hero Section ==================== --}}
    <section class="bg-surface-secondary px-20 py-20 text-center">
        <h1 class="text-foreground-primary text-[40px] font-bold">&gt; About Me</h1>
    </section>

    {{-- ==================== Bio Section ==================== --}}
    <section class="bg-surface-primary px-20 py-20">
        <div class="max-w-4xl mx-auto flex items-start gap-16">
            {{-- プロフィール画像 --}}
            <div class="w-64 h-64 bg-surface-card rounded-lg border border-border-subtle flex items-center justify-center shrink-0">
                <span class="text-foreground-muted text-xs">profile_photo</span>
            </div>
            {{-- 自己紹介テキスト --}}
            <div>
                <h2 class="text-foreground-primary text-2xl font-semibold mb-2">野原 拓人</h2>
                <p class="text-accent-primary text-sm mb-4">Takuto Nohara</p>
                <p class="text-foreground-secondary text-sm leading-relaxed">
                    独学でプログラミングを学んでいる学生です。Webアプリケーション開発を中心に、
                    映像制作やグラフィックデザインなど、幅広いアウトプットに取り組んでいます。
                    コードを書くことは「思考をレンダリングすること」だと考えています。
                    このポートフォリオ自体も、Laravel を学ぶための教材として制作しました。
                </p>
            </div>
        </div>
    </section>

    {{-- ==================== Skills / Rendering Pipeline Section ==================== --}}
    <section class="bg-surface-secondary px-20 py-20">
        <div class="max-w-4xl mx-auto">
            <h2 class="text-foreground-primary text-2xl font-semibold mb-12 text-center">
                &gt; rendering_pipeline
            </h2>

            <div class="grid grid-cols-3 gap-12">
                {{-- Languages --}}
                <div>
                    <h3 class="text-foreground-primary text-base font-semibold mb-6 pb-3 border-b border-border-subtle">
                        languages
                    </h3>
                    <ul class="space-y-3">
                        {{--
                            🎓【穴埋め問題 3】Tailwind CSS ユーティリティクラス
                            ──────────────────────────────────
                            Tailwind では小さなクラスを組み合わせてスタイルを構築します。

                            例: text-sm = font-size: 0.875rem
                                 text-foreground-secondary = カスタムカラー変数で文字色指定
                                 font-mono = font-family にモノスペースを使用（@theme で定義済み）

                            下のリストアイテムには既にクラスが適用されています。
                            同じパターンで新しいスキルを追加してみてください。
                        --}}
                        <li class="text-foreground-secondary text-sm font-mono">PHP</li>
                        <li class="text-foreground-secondary text-sm font-mono">JavaScript</li>
                        <li class="text-foreground-secondary text-sm font-mono">TypeScript</li>
                        <li class="text-foreground-secondary text-sm font-mono">HTML / CSS</li>
                        <li class="text-foreground-secondary text-sm font-mono">SQL</li>
                    </ul>
                </div>

                {{-- Frameworks --}}
                <div>
                    <h3 class="text-foreground-primary text-base font-semibold mb-6 pb-3 border-b border-border-subtle">
                        frameworks
                    </h3>
                    <ul class="space-y-3">
                        <li class="text-foreground-secondary text-sm font-mono">Laravel</li>
                        <li class="text-foreground-secondary text-sm font-mono">Tailwind CSS</li>
                        <li class="text-foreground-secondary text-sm font-mono">Vite</li>
                    </ul>
                </div>

                {{-- Tools --}}
                <div>
                    <h3 class="text-foreground-primary text-base font-semibold mb-6 pb-3 border-b border-border-subtle">
                        tools
                    </h3>
                    <ul class="space-y-3">
                        <li class="text-foreground-secondary text-sm font-mono">Git / GitHub</li>
                        <li class="text-foreground-secondary text-sm font-mono">VS Code</li>
                        <li class="text-foreground-secondary text-sm font-mono">Figma</li>
                        <li class="text-foreground-secondary text-sm font-mono">DaVinci Resolve</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    {{-- ==================== Experience Timeline Section ==================== --}}
    <section class="bg-surface-primary px-20 py-20">
        <div class="max-w-4xl mx-auto">
            <h2 class="text-foreground-primary text-2xl font-semibold mb-12 text-center">
                &gt; experience_log
            </h2>

            <div class="space-y-8 max-w-lg mx-auto">
                <div class="flex items-start gap-6">
                    <span class="text-accent-primary text-sm font-semibold shrink-0 w-16">2024-</span>
                    <div>
                        <h3 class="text-foreground-primary text-base font-semibold">個人制作活動</h3>
                        <p class="text-foreground-secondary text-sm mt-1">
                            ポートフォリオサイトの制作、Webアプリ開発など
                        </p>
                    </div>
                </div>
                <div class="flex items-start gap-6">
                    <span class="text-accent-primary text-sm font-semibold shrink-0 w-16">2023-</span>
                    <div>
                        <h3 class="text-foreground-primary text-base font-semibold">プログラミング学習開始</h3>
                        <p class="text-foreground-secondary text-sm mt-1">
                            PHP、JavaScript を独学で学び始める
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>

@endsection
