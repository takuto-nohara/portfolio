{{--
    ============================================================
    📄 管理画面 - 作品新規作成
    ============================================================
--}}

@extends('layouts.admin')
@section('title', '作品作成 - Admin')
@section('header', '&gt; 新規作品作成')

@section('content')

    <div class="max-w-3xl">
        <a href="{{ route('admin.works.index') }}"
           class="text-accent-primary text-xs hover:text-accent-secondary transition-colors mb-6 inline-block">
            &lt; back_to_list
        </a>

        <div class="bg-surface-primary rounded-lg border border-border-subtle p-8">
            <form action="{{ route('admin.works.store') }}" method="POST" enctype="multipart/form-data" class="space-y-6">
                @csrf

                {{-- タイトル --}}
                <div>
                    <label for="title" class="block text-foreground-primary text-sm font-medium mb-2">&gt; title</label>
                    <input type="text" id="title" name="title" value="{{ old('title') }}" required
                           class="w-full bg-surface-secondary border border-border-subtle rounded px-4 py-3 text-foreground-primary text-sm font-mono
                                  focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors">
                    @error('title') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                {{-- カテゴリ --}}
                <div>
                    <label for="category" class="block text-foreground-primary text-sm font-medium mb-2">&gt; category</label>
                    <select id="category" name="category" required
                            class="w-full bg-surface-secondary border border-border-subtle rounded px-4 py-3 text-foreground-primary text-sm font-mono
                                   focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors">
                        <option value="">select_category</option>
                        <option value="app" {{ old('category') == 'app' ? 'selected' : '' }}>output.app</option>
                        <option value="web" {{ old('category') == 'web' ? 'selected' : '' }}>output.web</option>
                        <option value="video" {{ old('category') == 'video' ? 'selected' : '' }}>output.video</option>
                        <option value="graphic" {{ old('category') == 'graphic' ? 'selected' : '' }}>output.graphic</option>
                    </select>
                    @error('category') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                {{-- 説明 --}}
                <div>
                    <label for="description" class="block text-foreground-primary text-sm font-medium mb-2">&gt; description</label>
                    <textarea id="description" name="description" rows="4" required
                              class="w-full bg-surface-secondary border border-border-subtle rounded px-4 py-3 text-foreground-primary text-sm font-mono resize-none
                                     focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors">{{ old('description') }}</textarea>
                    @error('description') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                {{-- 技術スタック --}}
                <div>
                    <label for="tech_stack" class="block text-foreground-primary text-sm font-medium mb-2">&gt; tech_stack</label>
                    <input type="text" id="tech_stack" name="tech_stack" value="{{ old('tech_stack') }}"
                           placeholder="PHP, Laravel, Tailwind CSS"
                           class="w-full bg-surface-secondary border border-border-subtle rounded px-4 py-3 text-foreground-primary text-sm font-mono
                                  focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors">
                    @error('tech_stack') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <div class="grid grid-cols-2 gap-6">
                    {{-- サムネイル --}}
                    <div>
                        <label for="thumbnail" class="block text-foreground-primary text-sm font-medium mb-2">&gt; thumbnail</label>
                        <input type="file" id="thumbnail" name="thumbnail" accept="image/*"
                               class="w-full bg-surface-secondary border border-border-subtle rounded px-4 py-3 text-foreground-primary text-sm font-mono file:mr-4 file:border-0 file:bg-accent-primary file:px-3 file:py-2 file:text-xs file:font-medium file:text-surface-primary">
                        <p class="text-foreground-muted text-xs mt-2">一覧と詳細のメイン画像になります。</p>
                        @error('thumbnail') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                    </div>

                    {{-- URL --}}
                    <div>
                        <label for="url" class="block text-foreground-primary text-sm font-medium mb-2">&gt; url</label>
                        <input type="url" id="url" name="url" value="{{ old('url') }}"
                               class="w-full bg-surface-secondary border border-border-subtle rounded px-4 py-3 text-foreground-primary text-sm font-mono
                                      focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors">
                    </div>
                    {{-- GitHub URL --}}
                    <div>
                        <label for="github_url" class="block text-foreground-primary text-sm font-medium mb-2">&gt; github_url</label>
                        <input type="url" id="github_url" name="github_url" value="{{ old('github_url') }}"
                               class="w-full bg-surface-secondary border border-border-subtle rounded px-4 py-3 text-foreground-primary text-sm font-mono
                                      focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors">
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-6">
                    {{-- 公開日 --}}
                    <div>
                        <label for="published_at" class="block text-foreground-primary text-sm font-medium mb-2">&gt; published_at</label>
                        <input type="date" id="published_at" name="published_at" value="{{ old('published_at') }}"
                               class="w-full bg-surface-secondary border border-border-subtle rounded px-4 py-3 text-foreground-primary text-sm font-mono
                                      focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors">
                    </div>
                    {{-- Featured --}}
                    <div>
                        <label class="block text-foreground-primary text-sm font-medium mb-2">&gt; is_featured</label>
                        <div class="flex items-center gap-3 h-11.5">
                            <input type="checkbox" id="is_featured" name="is_featured" value="1"
                                   {{ old('is_featured') ? 'checked' : '' }}
                                   class="w-4 h-4 accent-accent-primary">
                            <label for="is_featured" class="text-foreground-secondary text-sm">トップに表示</label>
                        </div>
                    </div>
                    {{-- 表示順 --}}
                    <div>
                        <label for="sort_order" class="block text-foreground-primary text-sm font-medium mb-2">&gt; sort_order</label>
                        <input type="number" id="sort_order" name="sort_order" value="{{ old('sort_order', 0) }}"
                               class="w-full bg-surface-secondary border border-border-subtle rounded px-4 py-3 text-foreground-primary text-sm font-mono
                                      focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors">
                    </div>
                </div>

                <div>
                    <label for="images" class="block text-foreground-primary text-sm font-medium mb-2">&gt; gallery_images</label>
                    <input type="file" id="images" name="images[]" accept="image/*" multiple
                           class="w-full bg-surface-secondary border border-border-subtle rounded px-4 py-3 text-foreground-primary text-sm font-mono file:mr-4 file:border-0 file:bg-accent-primary file:px-3 file:py-2 file:text-xs file:font-medium file:text-surface-primary">
                    <p class="text-foreground-muted text-xs mt-2">複数選択でギャラリー画像を追加できます。</p>
                    @error('images') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                    @error('images.*') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                {{-- 送信 --}}
                <div class="pt-4">
                    <button type="submit"
                            class="bg-accent-primary text-surface-primary text-sm font-medium px-8 py-3 rounded hover:bg-accent-secondary transition-colors">
                        &gt; create_work
                    </button>
                </div>
            </form>
        </div>
    </div>

@endsection

