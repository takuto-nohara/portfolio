{{--
    ============================================================
    📄 トップページ (Top Page)
    ============================================================
    design.pen の Top Page デザインを完全に模倣しています。
    Hero → Featured Works → About Teaser の構成です。
--}}

@extends('layouts.app')
@section('title', 'TN_ Portfolio')

@section('content')

    {{-- ==================== Hero Section ==================== --}}
    <section class="px-6 sm:px-20 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[calc(100vh-5rem)] hero-bg">
        {{-- パーティクルキャンバス背景 --}}
        <canvas id="hero-canvas" class="absolute inset-0 w-full h-full z-0 pointer-events-none" aria-hidden="true"></canvas>
        {{-- コンテンツ --}}
        <div class="relative z-10 flex flex-col items-center text-center">
            <h1 class="hero-item text-foreground-primary text-[56px] font-bold leading-tight tracking-tight" data-delay="0">
                Rendering Ideas<br>into Reality
            </h1>
            <p class="hero-item text-foreground-secondary text-base mt-6 max-w-xl leading-relaxed" data-delay="150">
                思考を目に見える形に。アプリ、Web、映像、グラフィック——<br>
                あらゆるアウトプットを通じて学びを深めています。
            </p>
            <div class="hero-item flex gap-4 mt-10" data-delay="300">
                <a href="{{ route('works.index') }}"
                   class="bg-accent-primary text-surface-primary text-sm font-medium px-8 py-3 rounded hover:bg-accent-secondary transition-colors">
                    &gt; view_all_works
                </a>
                <a href="{{ route('contact.index') }}"
                   class="border border-accent-primary text-accent-primary text-sm font-medium px-8 py-3 rounded hover:bg-accent-primary hover:text-surface-primary transition-colors">
                    &gt; contact_me
                </a>
            </div>
        </div>
    </section>

    {{-- ==================== Featured Works Section ==================== --}}
    <section class="bg-surface-secondary px-6 sm:px-20 py-12 sm:py-20">
        <div class="max-w-6xl mx-auto">
            <div class="flex items-baseline justify-between mb-12">
                <h2 class="text-foreground-primary text-2xl font-semibold">
                    &gt; featured_works
                </h2>
                <a href="{{ route('works.index') }}" class="text-accent-primary text-xs hover:text-accent-secondary transition-colors">
                    view_all &gt;
                </a>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                @forelse (($featuredWorks ?? []) as $work)
                    <a href="{{ route('works.show', $work->id) }}" class="group block">
                        <div class="bg-surface-card rounded-lg overflow-hidden border border-border-subtle hover:border-accent-primary transition-colors">
                            {{-- サムネイル --}}
                            <div class="aspect-video bg-border-subtle flex items-center justify-center">
                                @if ($work->thumbnail)
                                    <img src="{{ asset('storage/' . $work->thumbnail) }}" alt="{{ $work->title }}" class="w-full h-full object-cover">
                                @else
                                    <span class="text-foreground-muted text-xs">no_thumbnail</span>
                                @endif
                            </div>
                            {{-- カード情報 --}}
                            <div class="p-5">
                                <span class="text-accent-primary text-[10px] font-medium uppercase tracking-widest">
                                    output.{{ $work->category->value }}
                                </span>
                                <h3 class="text-foreground-primary text-base font-semibold mt-2 group-hover:text-accent-primary transition-colors">
                                    {{ $work->title }}
                                </h3>
                                <p class="text-foreground-secondary text-xs mt-2 leading-relaxed line-clamp-2">
                                    {{ $work->description }}
                                </p>
                            </div>
                        </div>
                    </a>
                @empty
                    <p class="text-foreground-muted text-sm col-span-3 text-center py-12">
                        // まだ作品が登録されていません
                    </p>
                @endforelse
            </div>
        </div>
    </section>

    {{-- ==================== About Teaser Section ==================== --}}
    <section class="bg-surface-primary px-6 sm:px-20 py-12 sm:py-20">
        <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-8 sm:gap-16">
            <x-profile-avatar size-class="w-48 h-48 sm:w-80 sm:h-80" />
            {{-- テキスト --}}
            <div>
                <h2 class="text-foreground-primary text-2xl font-semibold mb-4">
                    &gt; about_me
                </h2>
                <p class="text-foreground-secondary text-sm leading-relaxed mb-6">
                    『欲しいものが見当たらない？ならば作ってしまえばいい！』を<br>
                    モットーに様々なコンテンツの制作を行っています。
                </p>
                <a href="{{ route('about') }}"
                   class="text-accent-primary text-sm font-medium hover:text-accent-secondary transition-colors">
                    &gt; learn_more
                </a>
            </div>
        </div>
    </section>

@endsection
