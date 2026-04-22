{{--
    ============================================================
    📄 作品一覧ページ (Works List)
    ============================================================
    design.pen の Works List Page デザインを模倣。
    Hero → カテゴリフィルター → 作品カードグリッド の構成。
--}}

@extends('layouts.app')
@section('title', 'Works - TN_ Portfolio')

@section('content')

    {{-- ==================== Hero Section ==================== --}}
    <section class="bg-surface-secondary px-6 sm:px-20 py-12 sm:py-20 text-center">
        <h1 class="text-foreground-primary text-[40px] font-bold">&gt; All Works</h1>
    </section>

    {{-- ==================== Category Filter ==================== --}}
    <section class="bg-surface-primary px-6 sm:px-20 pt-8 sm:pt-12 pb-4">
        <div class="max-w-6xl mx-auto">
            <div class="flex flex-wrap gap-3">
                <a href="{{ route('works.index') }}"
                   class="px-4 py-2 rounded text-xs font-medium transition-colors
                          {{ !request()->get('category') ? 'bg-accent-primary text-surface-primary' : 'bg-surface-card text-foreground-secondary hover:bg-border-subtle' }}">
                    all()
                </a>
                @foreach (['app', 'web', 'video', 'graphic'] as $cat)
                    <a href="{{ route('works.index', ['category' => $cat]) }}"
                       class="px-4 py-2 rounded text-xs font-medium transition-colors
                              {{ request()->get('category') === $cat ? 'bg-accent-primary text-surface-primary' : 'bg-surface-card text-foreground-secondary hover:bg-border-subtle' }}">
                        output.{{ $cat }}
                    </a>
                @endforeach
            </div>
        </div>
    </section>

    {{-- ==================== Works Grid ==================== --}}
    <section class="bg-surface-primary px-6 sm:px-20 py-8 sm:py-12">
        <div class="max-w-6xl mx-auto">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                @forelse ($workList as $work)
                    <a href="{{ route('works.show', $work->id) }}" class="group block">
                        <div class="bg-surface-primary rounded-lg overflow-hidden border border-border-subtle hover:border-accent-primary transition-colors">
                            {{-- サムネイル --}}
                            <div class="aspect-video bg-surface-card flex items-center justify-center">
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
                        // 作品が見つかりませんでした
                    </p>
                @endforelse
            </div>
        </div>
    </section>

@endsection
