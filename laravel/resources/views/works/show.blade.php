{{--
    ============================================================
    📄 作品詳細ページ (Works Detail)
    ============================================================
    design.pen の Works Detail Page デザインを模倣。
    Hero Image → メタ情報 → Description → Tech Stack → Links → Gallery
--}}

@extends('layouts.app')
@section('title', $workDetail->title . ' - TN_ Portfolio')

@section('content')

    {{-- ==================== Hero Image Section ==================== --}}
    <section class="bg-surface-card">
        <div class="max-w-6xl mx-auto aspect-16/7 flex items-center justify-center">
            @if ($workDetail->thumbnail)
                <img src="{{ asset('storage/' . $workDetail->thumbnail) }}" alt="{{ $workDetail->title }}" class="w-full h-full object-cover">
            @else
                <span class="text-foreground-muted text-sm">hero_image</span>
            @endif
        </div>
    </section>

    {{-- ==================== Work Info Section ==================== --}}
    <section class="bg-surface-primary px-20 py-16">
        <div class="max-w-4xl mx-auto">
            {{-- カテゴリタグ --}}
            <span class="inline-block bg-surface-card text-accent-primary text-[10px] font-medium uppercase tracking-widest px-3 py-1 rounded">
                {{--
                    🎓【穴埋め問題 6】Enum のプロパティアクセス
                    ──────────────────────────────────
                    $workDetail->category は Category enum です。
                    ->value で enum の文字列値（'app', 'web' 等）を取得できます。
                --}}
                output.{{ $workDetail->category->value }}
            </span>

            {{-- タイトルと日付 --}}
            <h1 class="text-foreground-primary text-3xl font-bold mt-4">
                {{ $workDetail->title }}
            </h1>
            @if ($workDetail->publishedAt)
                <p class="text-foreground-muted text-xs mt-2">
                    published: {{ $workDetail->publishedAt }}
                </p>
            @endif

            {{-- 説明文 --}}
            <div class="mt-10">
                <h2 class="text-foreground-primary text-lg font-semibold mb-4">&gt; description</h2>
                <p class="text-foreground-secondary text-sm leading-relaxed">
                    {{ $workDetail->description }}
                </p>
            </div>

            {{-- 技術スタック --}}
            <div class="mt-10">
                <h2 class="text-foreground-primary text-lg font-semibold mb-4">&gt; tech_stack</h2>
                <div class="flex flex-wrap gap-2">
                    {{--
                        🎓【穴埋め問題 7】explode() と @foreach
                        ──────────────────────────────────
                        $workDetail->techStack は "PHP, Laravel, Tailwind" のようなカンマ区切り文字列です。
                        explode(',', $string) で配列に分割し、
                        trim() で前後の空白を除去しています。
                    --}}
                    @foreach (explode(',', $workDetail->techStack) as $tech)
                        <span class="bg-surface-card text-foreground-secondary text-xs px-3 py-1 rounded border border-border-subtle">
                            {{ trim($tech) }}
                        </span>
                    @endforeach
                </div>
            </div>

            {{-- リンクボタン --}}
            <div class="flex gap-4 mt-10">
                {{--
                    🎓【穴埋め問題 8】@if による条件付きレンダリング
                    ──────────────────────────────────
                    @if はPHPの if 文をBladeで書く方法です。
                    $workDetail->githubUrl が null でない場合のみリンクを表示します。
                --}}
                @if ($workDetail->githubUrl)
                    <a href="{{ $workDetail->githubUrl }}" target="_blank" rel="noopener noreferrer"
                       class="bg-foreground-primary text-surface-primary text-sm font-medium px-6 py-3 rounded hover:bg-foreground-secondary transition-colors">
                        &gt; github_repo
                    </a>
                @endif
                @if ($workDetail->url)
                    <a href="{{ $workDetail->url }}" target="_blank" rel="noopener noreferrer"
                       class="border border-accent-primary text-accent-primary text-sm font-medium px-6 py-3 rounded hover:bg-accent-primary hover:text-surface-primary transition-colors">
                        &gt; live_demo
                    </a>
                @endif
            </div>

            {{-- ギャラリーセクション --}}
            <div class="mt-16">
                <h2 class="text-foreground-primary text-lg font-semibold mb-6">&gt; gallery</h2>
                <div class="grid grid-cols-3 gap-4">
                    @for ($i = 0; $i < 3; $i++)
                        <div class="aspect-video bg-surface-card rounded-lg border border-border-subtle flex items-center justify-center">
                            <span class="text-foreground-muted text-xs">screenshot_{{ $i + 1 }}</span>
                        </div>
                    @endfor
                </div>
            </div>
        </div>
    </section>

@endsection
