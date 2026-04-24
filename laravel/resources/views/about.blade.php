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
    <section class="bg-surface-secondary px-6 sm:px-20 py-12 sm:py-20 text-center">
        <h1 class="text-foreground-primary text-[40px] font-bold">&gt; About Me</h1>
    </section>

    {{-- ==================== Bio Section ==================== --}}
    <section class="bg-surface-primary px-6 sm:px-20 py-12 sm:py-20">
        <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-start gap-8 sm:gap-16">
            <x-profile-avatar size-class="w-48 h-48 sm:w-64 sm:h-64" />
            {{-- 自己紹介テキスト --}}
            <div>
                <h2 class="text-foreground-primary text-2xl font-semibold mb-2">野原 拓人</h2>
                <p class="text-accent-primary text-sm mb-6">Takuto Nohara</p>
                <div class="space-y-4 text-foreground-secondary text-sm leading-relaxed">
                    <p>
                        中学生のころ、動画編集をきっかけにコンテンツ制作の世界に入りました。
                        映像から始まり、パンフレット、Web ページ、そしてアプリケーション開発へ——
                        「欲しいものが見当たらないなら自分で作ればいい」という姿勢で、
                        幅広いアウトプットに取り組んできた大学生です。
                    </p>
                    <p>
                        現在はフロントエンドからバックエンドまで、Web アプリケーション開発を軸に学習を深めています。
                        コードを書くことは「思考をレンダリングすること」——頭の中のアイデアを
                        動いて触れる形へ変換するプロセスが好きです。
                    </p>
                    <p>
                        将来はエンジニアとして就職することを目指しており、このポートフォリオはその第一歩として制作しました。
                    </p>
                </div>
            </div>
        </div>
    </section>

    {{-- ==================== Skills / Tech Stack Section ==================== --}}
    <section class="bg-surface-secondary px-6 sm:px-20 py-12 sm:py-20">
        <div class="max-w-5xl mx-auto">
            <h2 class="text-foreground-primary text-2xl font-semibold mb-12 text-center">
                &gt; skills / tech_stack
            </h2>

            <div class="grid skills-grid gap-8">
                {{-- Languages --}}
                <div>
                    <h3 class="text-foreground-primary text-base font-semibold mb-6 pb-3 border-b border-border-subtle">
                        languages
                    </h3>
                    <ul class="space-y-3">
                        <li class="text-foreground-secondary text-sm font-mono">TypeScript</li>
                        <li class="text-foreground-secondary text-sm font-mono">JavaScript</li>
                        <li class="text-foreground-secondary text-sm font-mono">PHP</li>
                        <li class="text-foreground-secondary text-sm font-mono">HTML / CSS</li>
                        <li class="text-foreground-secondary text-sm font-mono">Java</li>
                        <li class="text-foreground-secondary text-sm font-mono">C</li>
                    </ul>
                </div>

                {{-- Frameworks / Libraries --}}
                <div>
                    <h3 class="text-foreground-primary text-base font-semibold mb-6 pb-3 border-b border-border-subtle">
                        frameworks
                    </h3>
                    <ul class="space-y-3">
                        <li class="text-foreground-secondary text-sm font-mono">React</li>
                        <li class="text-foreground-secondary text-sm font-mono">Next.js</li>
                        <li class="text-foreground-secondary text-sm font-mono">Angular</li>
                        <li class="text-foreground-secondary text-sm font-mono">Laravel</li>
                        <li class="text-foreground-secondary text-sm font-mono">Hono</li>
                        <li class="text-foreground-secondary text-sm font-mono">Tailwind CSS</li>
                        <li class="text-foreground-secondary text-sm font-mono">Vite</li>
                        <li class="text-foreground-secondary text-sm font-mono">Vitest</li>
                    </ul>
                </div>

                {{-- Platform & Infra --}}
                <div>
                    <h3 class="text-foreground-primary text-base font-semibold mb-6 pb-3 border-b border-border-subtle">
                        platform & infra
                    </h3>
                    <ul class="space-y-3">
                        <li class="text-foreground-secondary text-sm font-mono">Firebase</li>
                        <li class="text-foreground-secondary text-sm font-mono">Cloudflare</li>
                        <li class="text-foreground-secondary text-sm font-mono">Docker</li>
                        <li class="text-foreground-secondary text-sm font-mono">Stripe</li>
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
                        <li class="text-foreground-secondary text-sm font-mono">ESLint</li>
                        <li class="text-foreground-secondary text-sm font-mono">Figma</li>
                        <li class="text-foreground-secondary text-sm font-mono">Pencil</li>
                        <li class="text-foreground-secondary text-sm font-mono">DaVinci Resolve</li>
                        <li class="text-foreground-secondary text-sm font-mono">Affinity</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    {{-- ==================== Experience Timeline Section ==================== --}}
    <section class="bg-surface-primary px-6 sm:px-20 py-12 sm:py-20">
        <div class="max-w-4xl mx-auto">
            <h2 class="text-foreground-primary text-2xl font-semibold mb-12 text-center">
                &gt; experience_log
            </h2>

            <div class="space-y-8 max-w-2xl mx-auto">

                {{-- 2026 春 --}}
                <div class="flex items-start gap-6">
                    <span class="text-accent-primary text-sm font-semibold shrink-0 w-20">2026.04</span>
                    <div>
                        <h3 class="text-foreground-primary text-base font-semibold">学園祭実行委員会 紹介サイトを新設</h3>
                        <p class="text-foreground-secondary text-sm mt-1">
                            工学院大学・学園祭実行委員会の紹介サイトを設計・公開。
                            Cloudflare D1 / R2 を組み合わせた疑似 CMS 構成で、独自ドメイン取得から保守・運用まで一人で担当。
                        </p>
                        <a href="https://www.kute-fes.com/" target="_blank" rel="noopener noreferrer"
                           class="inline-block mt-1 text-accent-primary text-xs hover:underline">
                            kute-fes.com →
                        </a>
                    </div>
                </div>

                {{-- 2025 冬 --}}
                <div class="flex items-start gap-6">
                    <span class="text-accent-primary text-sm font-semibold shrink-0 w-20">2025.12</span>
                    <div>
                        <h3 class="text-foreground-primary text-base font-semibold">株式会社 Zequt — 創業初期エンジニアとして参加</h3>
                        <p class="text-foreground-secondary text-sm mt-1">
                            友人の創業した会社に創業初期エンジニアとして加わる。
                            Web アプリ開発（フロント・バック）、ホームページ制作、パンフレットデザインを担当し、現在に至る。
                        </p>
                    </div>
                </div>

                {{-- 2025 秋 --}}
                <div class="flex items-start gap-6">
                    <span class="text-accent-primary text-sm font-semibold shrink-0 w-20">2025.10</span>
                    <div>
                        <h3 class="text-foreground-primary text-base font-semibold">Web アプリ開発 / VTuber チームリーダー</h3>
                        <p class="text-foreground-secondary text-sm mt-1">
                            所属する工学院大学 VR プロジェクトの運営効率化のため、TypeScript / React / Tailwind CSS を用いたタスク管理ツールを独学で開発・公開。
                            並行してシフト作成補助アプリ・LMS 拡張機能など複数のアプリを制作。
                            VTuber チームのリーダーとして広報・イベント告知動画を 10 本以上制作し、チームを率いた。
                        </p>
                    </div>
                </div>

                {{-- 2025 夏 --}}
                <div class="flex items-start gap-6">
                    <span class="text-accent-primary text-sm font-semibold shrink-0 w-20">2025.08</span>
                    <div>
                        <h3 class="text-foreground-primary text-base font-semibold">学園祭サイト 制作・公開（初の Web サイト）</h3>
                        <p class="text-foreground-secondary text-sm mt-1">
                            学園祭実行委員会の業務として、その年の学園祭情報をまとめるサイトを HTML / CSS / JavaScript で制作・公開。
                            独学ながら初めて実際にリリースしたプロジェクト。
                        </p>
                        <a href="https://www.ns.kogakuin.ac.jp/hachisai/2025/" target="_blank" rel="noopener noreferrer"
                           class="inline-block mt-1 text-accent-primary text-xs hover:underline">
                            hachisai 2025 →
                        </a>
                    </div>
                </div>

                {{-- 2024 --}}
                <div class="flex items-start gap-6">
                    <span class="text-accent-primary text-sm font-semibold shrink-0 w-20">2024.04</span>
                    <div>
                        <h3 class="text-foreground-primary text-base font-semibold">大学入学 — プログラミング初体験</h3>
                        <p class="text-foreground-secondary text-sm mt-1">
                            大学の授業で C 言語に初めて触れ、プログラミングの基礎を習得。
                        </p>
                    </div>
                </div>

                {{-- 2020 --}}
                <div class="flex items-start gap-6">
                    <span class="text-accent-primary text-sm font-semibold shrink-0 w-20">2020.04</span>
                    <div>
                        <h3 class="text-foreground-primary text-base font-semibold">動画編集を開始</h3>
                        <p class="text-foreground-secondary text-sm mt-1">
                            DaVinci Resolve を独学し、配信者の切り抜き動画や友人間の思い出動画を制作。
                            高校卒業まで断続的に続け、後に大学の VR プロジェクトで MV・広報動画の制作へと発展。
                        </p>
                    </div>
                </div>

            </div>
        </div>
    </section>

@endsection
