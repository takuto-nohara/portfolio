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
    <section class="bg-surface-primary px-6 sm:px-20 py-10 sm:py-16">
        <div class="max-w-4xl mx-auto">
            {{-- カテゴリタグ --}}
            <span class="inline-block bg-surface-card text-accent-primary text-[10px] font-medium uppercase tracking-widest px-3 py-1 rounded">
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
                    @foreach (explode(',', $workDetail->techStack) as $tech)
                        <span class="bg-surface-card text-foreground-secondary text-xs px-3 py-1 rounded border border-border-subtle">
                            {{ trim($tech) }}
                        </span>
                    @endforeach
                </div>
            </div>

            {{-- リンクボタン --}}
            <div class="flex gap-4 mt-10">
                @if ($workDetail->githubUrl)
                    <a href="{{ $workDetail->githubUrl }}" target="_blank" rel="noopener noreferrer"
                       class="bg-foreground-primary text-surface-primary text-sm font-medium px-6 py-3 rounded hover:bg-foreground-secondary transition-colors">
                        &gt; github_repo
                    </a>
                @endif
                @if ($workDetail->url)
                    <a href="{{ $workDetail->url }}" target="_blank" rel="noopener noreferrer"
                       class="border border-accent-primary text-accent-primary text-sm font-medium px-6 py-3 rounded hover:bg-accent-primary hover:text-surface-primary transition-colors">
                        &gt; visit_site
                    </a>
                @endif
            </div>

            {{-- ギャラリーセクション --}}
            <div class="mt-16">
                <h2 class="text-foreground-primary text-lg font-semibold mb-6">&gt; gallery</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    @forelse ($workDetail->images as $index => $image)
                        <button type="button"
                                class="group aspect-video bg-surface-card rounded-lg border border-border-subtle overflow-hidden text-left transition-transform hover:-translate-y-1 hover:border-accent-primary"
                                data-gallery-trigger
                                data-gallery-index="{{ $index }}"
                                aria-label="{{ $workDetail->title }} の画像 {{ $index + 1 }} を拡大表示">
                            <img src="{{ asset('storage/' . $image->imagePath) }}" alt="{{ $workDetail->title }} gallery image" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
                        </button>
                    @empty
                        <div class="aspect-video bg-surface-card rounded-lg border border-border-subtle flex items-center justify-center md:col-span-3">
                            <span class="text-foreground-muted text-xs">gallery_images_not_found</span>
                        </div>
                    @endforelse
                </div>
            </div>
        </div>
    </section>

    @if (count($workDetail->images) > 0)
        <div id="gallery-modal" class="fixed inset-0 z-60 hidden" aria-hidden="true">
            <div class="absolute inset-0 bg-surface-primary/90 backdrop-blur-sm" data-gallery-close></div>
            <div class="relative flex h-full w-full items-center justify-center px-4 py-6 sm:px-8">
                <div class="mx-auto w-fit" style="max-width: min(60vw, 760px);">
                    <div class="inline-flex flex-col items-center rounded-2xl border border-border-subtle bg-surface-secondary p-3 shadow-2xl sm:p-4">
                        <div class="mb-3 flex w-full justify-end">
                            <button type="button"
                                class="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface-primary text-2xl leading-none text-foreground-primary hover:border-accent-primary hover:text-accent-primary transition-colors"
                                data-gallery-close
                                aria-label="モーダルを閉じる">
                                &times;
                            </button>
                        </div>

                        <div class="flex items-center justify-center gap-3 sm:gap-4">
                            <button type="button"
                                    class="shrink-0 rounded-full border border-border-subtle bg-surface-primary px-4 py-3 text-foreground-primary hover:border-accent-primary hover:text-accent-primary transition-colors"
                                    data-gallery-prev
                                    aria-label="前の画像を表示">
                                &larr;
                            </button>

                            <div class="flex items-center justify-center rounded-xl border border-border-subtle bg-surface-primary px-3 py-3 sm:px-4 sm:py-4">
                                <img id="gallery-modal-image" src="" alt="" class="mx-auto block h-auto w-auto object-contain" style="max-width: min(46vw, 640px); max-height: 44vh;">
                            </div>

                            <button type="button"
                                    class="shrink-0 rounded-full border border-border-subtle bg-surface-primary px-4 py-3 text-foreground-primary hover:border-accent-primary hover:text-accent-primary transition-colors"
                                    data-gallery-next
                                    aria-label="次の画像を表示">
                                &rarr;
                            </button>
                        </div>

                        <div class="mt-3 flex w-full items-start justify-between gap-4 px-1" style="max-width: min(46vw, 640px);">
                            <p id="gallery-modal-caption" class="min-h-6 text-sm leading-relaxed text-foreground-secondary"></p>
                            <span id="gallery-modal-count" class="shrink-0 pt-0.5 text-xs text-foreground-muted"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    @endif

@endsection

@push('scripts')
    @if (count($workDetail->images) > 0)
        @php
            $galleryImages = collect($workDetail->images)
                ->map(fn ($image) => [
                    'src' => asset('storage/' . $image->imagePath),
                    'caption' => $image->caption,
                    'alt' => $workDetail->title . ' gallery image',
                ])
                ->values();
        @endphp
        <script>
            (function () {
                const images = @json($galleryImages);

                const modal = document.getElementById('gallery-modal');
                const modalImage = document.getElementById('gallery-modal-image');
                const modalCaption = document.getElementById('gallery-modal-caption');
                const modalCount = document.getElementById('gallery-modal-count');
                const triggers = document.querySelectorAll('[data-gallery-trigger]');
                const prevButton = document.querySelector('[data-gallery-prev]');
                const nextButton = document.querySelector('[data-gallery-next]');
                const closeButtons = document.querySelectorAll('[data-gallery-close]');
                let currentIndex = 0;

                function render(index) {
                    currentIndex = (index + images.length) % images.length;
                    const current = images[currentIndex];
                    modalImage.src = current.src;
                    modalImage.alt = current.alt;
                    modalCaption.textContent = current.caption || '説明は未設定です。';
                    modalCount.textContent = (currentIndex + 1) + ' / ' + images.length;
                }

                function openModal(index) {
                    render(index);
                    modal.classList.remove('hidden');
                    document.body.classList.add('overflow-hidden');
                    modal.setAttribute('aria-hidden', 'false');
                }

                function closeModal() {
                    modal.classList.add('hidden');
                    document.body.classList.remove('overflow-hidden');
                    modal.setAttribute('aria-hidden', 'true');
                }

                triggers.forEach(function (trigger) {
                    trigger.addEventListener('click', function () {
                        openModal(Number(trigger.dataset.galleryIndex || 0));
                    });
                });

                prevButton.addEventListener('click', function () {
                    render(currentIndex - 1);
                });

                nextButton.addEventListener('click', function () {
                    render(currentIndex + 1);
                });

                closeButtons.forEach(function (button) {
                    button.addEventListener('click', closeModal);
                });

                document.addEventListener('keydown', function (event) {
                    if (modal.classList.contains('hidden')) {
                        return;
                    }

                    if (event.key === 'Escape') {
                        closeModal();
                    }

                    if (event.key === 'ArrowLeft') {
                        render(currentIndex - 1);
                    }

                    if (event.key === 'ArrowRight') {
                        render(currentIndex + 1);
                    }
                });
            })();
        </script>
    @endif
@endpush
