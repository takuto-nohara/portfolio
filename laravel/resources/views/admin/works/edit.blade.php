{{--
    ============================================================
    📄 管理画面 - 作品編集
    ============================================================
--}}

@extends('layouts.admin')
@section('title', '作品編集 - Admin')
@section('header', '&gt; 作品編集')

@section('content')

    <div class="max-w-3xl">
        <a href="{{ route('admin.works.index') }}"
           class="text-accent-primary text-xs hover:text-accent-secondary transition-colors mb-6 inline-block">
            &lt; back_to_list
        </a>

        <div class="bg-surface-primary rounded-lg border border-border-subtle p-8">
            <form action="{{ route('admin.works.update', $workDetail->id) }}" method="POST" enctype="multipart/form-data" class="space-y-6">
                @csrf
                @method('PUT')

                {{-- タイトル --}}
                <div>
                    <label for="title" class="block text-foreground-primary text-sm font-medium mb-2">&gt; title</label>
                    <input type="text" id="title" name="title" value="{{ old('title', $workDetail->title) }}" required
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
                        @foreach (\App\Domain\ValueObjects\Category::cases() as $category)
                            <option value="{{ $category->value }}" {{ old('category', $workDetail->category->value) == $category->value ? 'selected' : '' }}>
                                output.{{ $category->value }}
                            </option>
                        @endforeach
                    </select>
                    @error('category') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                {{-- 説明 --}}
                <div>
                    <label for="description" class="block text-foreground-primary text-sm font-medium mb-2">&gt; description</label>
                    <textarea id="description" name="description" rows="4" required
                              class="w-full bg-surface-secondary border border-border-subtle rounded px-4 py-3 text-foreground-primary text-sm font-mono resize-none
                                     focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors">{{ old('description', $workDetail->description) }}</textarea>
                    @error('description') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                {{-- 技術スタック --}}
                <div>
                    <label for="tech_stack" class="block text-foreground-primary text-sm font-medium mb-2">&gt; tech_stack</label>
                    <input type="text" id="tech_stack" name="tech_stack" value="{{ old('tech_stack', $workDetail->techStack) }}"
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
                        <span id="thumbnail-name" class="text-foreground-muted text-xs font-mono mt-1 hidden"></span>
                        @if ($workDetail->thumbnail)
                            <div class="mt-3 flex items-center gap-3">
                                <img src="{{ asset('storage/' . $workDetail->thumbnail) }}" alt="{{ $workDetail->title }}" class="w-20 h-20 rounded object-cover border border-border-subtle">
                                <span class="text-foreground-muted text-xs break-all">{{ $workDetail->thumbnail }}</span>
                            </div>
                        @endif
                        @error('thumbnail') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                    </div>

                    {{-- URL --}}
                    <div>
                        <label for="url" class="block text-foreground-primary text-sm font-medium mb-2">&gt; url</label>
                        <input type="url" id="url" name="url" value="{{ old('url', $workDetail->url) }}"
                               class="w-full bg-surface-secondary border border-border-subtle rounded px-4 py-3 text-foreground-primary text-sm font-mono
                                      focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors">
                    </div>
                    {{-- GitHub URL --}}
                    <div>
                        <label for="github_url" class="block text-foreground-primary text-sm font-medium mb-2">&gt; github_url</label>
                        <input type="url" id="github_url" name="github_url" value="{{ old('github_url', $workDetail->githubUrl) }}"
                               class="w-full bg-surface-secondary border border-border-subtle rounded px-4 py-3 text-foreground-primary text-sm font-mono
                                      focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors">
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-6">
                    {{-- 公開日 --}}
                    <div>
                        <label for="published_at" class="block text-foreground-primary text-sm font-medium mb-2">&gt; published_at</label>
                        <input type="date" id="published_at" name="published_at" value="{{ old('published_at', $workDetail->publishedAt) }}"
                               class="w-full bg-surface-secondary border border-border-subtle rounded px-4 py-3 text-foreground-primary text-sm font-mono
                                      focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors">
                    </div>
                    {{-- Featured --}}
                    <div>
                        <label class="block text-foreground-primary text-sm font-medium mb-2">&gt; is_featured</label>
                        <div class="flex items-center gap-3 h-11.5">
                            <input type="checkbox" id="is_featured" name="is_featured" value="1"
                                   {{ old('is_featured', $workDetail->isFeatured) ? 'checked' : '' }}
                                   class="w-4 h-4 accent-accent-primary">
                            <label for="is_featured" class="text-foreground-secondary text-sm">トップに表示</label>
                        </div>
                    </div>
                    {{-- 表示順 --}}
                    <div>
                        <label for="sort_order" class="block text-foreground-primary text-sm font-medium mb-2">&gt; sort_order</label>
                        <input type="number" id="sort_order" name="sort_order" value="{{ old('sort_order', $workDetail->sortOrder) }}"
                               class="w-full bg-surface-secondary border border-border-subtle rounded px-4 py-3 text-foreground-primary text-sm font-mono
                                      focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors">
                    </div>
                </div>

                <div>
                    <label for="images" class="block text-foreground-primary text-sm font-medium mb-2">&gt; add_gallery_images</label>
                    <input type="file" id="images" name="images[]" accept="image/*" multiple
                           class="w-full bg-surface-secondary border border-border-subtle rounded px-4 py-3 text-foreground-primary text-sm font-mono file:mr-4 file:border-0 file:bg-accent-primary file:px-3 file:py-2 file:text-xs file:font-medium file:text-surface-primary">
                    <p class="text-foreground-muted text-xs mt-2">Ctrl/Cmd を押しながらクリックで複数選択できます。</p>
                    <ul id="images-preview" class="mt-3 space-y-2 hidden"></ul>
                    @error('images') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                    @error('images.*') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                    @error('captions.*') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                {{-- 送信 --}}
                <div class="pt-4">
                    <button type="submit"
                            class="bg-accent-primary text-surface-primary text-sm font-medium px-8 py-3 rounded hover:bg-accent-secondary transition-colors">
                        &gt; update_work
                    </button>
                </div>
            </form>

            {{-- current_gallery はネスト防止のためフォームの外に配置 --}}
            <div class="mt-8">
                <h2 class="text-foreground-primary text-sm font-medium mb-3">&gt; current_gallery</h2>

                @if (count($workDetail->images) > 0)
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        @foreach ($workDetail->images as $image)
                            <div class="bg-surface-secondary border border-border-subtle rounded-lg p-4 space-y-3">
                                <img src="{{ asset('storage/' . $image->imagePath) }}" alt="{{ $workDetail->title }} gallery image" class="w-full aspect-video object-cover rounded">
                                <form action="{{ route('admin.works.images.update', ['workId' => $workDetail->id, 'imageId' => $image->id]) }}" method="POST" class="space-y-3">
                                    @csrf
                                    @method('PATCH')
                                    <div>
                                        <label for="caption-{{ $image->id }}" class="block text-foreground-primary text-xs font-medium mb-2">caption</label>
                                        <input type="text" id="caption-{{ $image->id }}" name="caption" value="{{ old('caption', $image->caption) }}"
                                               placeholder="画像説明を入力"
                                               class="w-full bg-surface-primary border border-border-subtle rounded px-3 py-2 text-foreground-primary text-xs font-mono focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors">
                                    </div>
                                    <div class="flex items-center justify-between gap-3">
                                        <span class="text-foreground-muted text-xs">order: {{ $image->sortOrder }}</span>
                                        <button type="submit" class="text-accent-primary text-xs hover:text-accent-secondary transition-colors">
                                            save_caption
                                        </button>
                                    </div>
                                </form>
                                <div class="flex items-center justify-end gap-3">
                                    <form action="{{ route('admin.works.images.destroy', ['workId' => $workDetail->id, 'imageId' => $image->id]) }}" method="POST">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="text-red-500 text-xs hover:text-red-700 transition-colors" onclick="return confirm('この画像を削除しますか？')">
                                            delete_image
                                        </button>
                                    </form>
                                </div>
                            </div>
                        @endforeach
                    </div>
                @else
                    <p class="text-foreground-muted text-xs">gallery_images_not_found</p>
                @endif
            </div>
        </div>
    </div>

@endsection

@push('scripts')
<script>
    document.getElementById('thumbnail').addEventListener('change', function () {
        const span = document.getElementById('thumbnail-name');
        if (this.files.length > 0) {
            const file = this.files[0];
            const sizeKB = (file.size / 1024).toFixed(1);
            span.textContent = '+ ' + file.name + ' (' + sizeKB + ' KB)';
            span.classList.remove('hidden');
        } else {
            span.classList.add('hidden');
        }
    });

    document.getElementById('images').addEventListener('change', function () {
        const preview = document.getElementById('images-preview');
        preview.innerHTML = '';

        if (this.files.length === 0) {
            preview.classList.add('hidden');
            return;
        }

        preview.classList.remove('hidden');
        Array.from(this.files).forEach(function (file) {
            const li = document.createElement('li');
            li.className = 'bg-surface-secondary border border-border-subtle rounded p-3 space-y-2';

            const nameRow = document.createElement('p');
            nameRow.className = 'text-foreground-muted text-xs font-mono';
            const sizeKB = (file.size / 1024).toFixed(1);
            nameRow.textContent = '+ ' + file.name + ' (' + sizeKB + ' KB)';
            li.appendChild(nameRow);

            const input = document.createElement('input');
            input.type = 'text';
            input.name = 'captions[]';
            input.placeholder = 'caption (任意)';
            input.className = 'w-full bg-surface-primary border border-border-subtle rounded px-3 py-2 text-foreground-primary text-xs font-mono focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors';
            li.appendChild(input);

            preview.appendChild(li);
        });
    });
</script>
@endpush
