{{--
    ============================================================
    📄 管理画面 - 作品一覧
    ============================================================
--}}

@extends('layouts.admin')
@section('title', '作品管理 - Admin')
@section('header', '&gt; 制作物管理')

@section('content')

    {{-- ヘッダーアクション --}}
    <div class="flex justify-between items-center mb-8">
        <p class="text-foreground-secondary text-sm">
            登録作品数: {{ count($workList) }}
        </p>
        <a href="{{ route('admin.works.create') }}"
           class="bg-accent-primary text-surface-primary text-sm font-medium px-6 py-2 rounded hover:bg-accent-secondary transition-colors">
            &gt; new_work
        </a>
    </div>

    {{-- 作品テーブル --}}
    <div class="bg-surface-primary rounded-lg border border-border-subtle overflow-hidden">
        <table class="w-full">
            <thead>
                <tr class="bg-surface-secondary text-foreground-secondary text-xs uppercase tracking-wider">
                    <th class="px-6 py-3 text-left">タイトル</th>
                    <th class="px-6 py-3 text-left">カテゴリ</th>
                    <th class="px-6 py-3 text-left">公開日</th>
                    <th class="px-6 py-3 text-left">表示順</th>
                    <th class="px-6 py-3 text-left">Featured</th>
                    <th class="px-6 py-3 text-right">操作</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
                @foreach ($workList as $work)
                    <tr class="hover:bg-surface-secondary/50 transition-colors">
                        <td class="px-6 py-4 text-foreground-primary text-sm font-medium">
                            {{ $work->title }}
                        </td>
                        <td class="px-6 py-4">
                            <span class="inline-block bg-surface-card text-accent-primary text-[10px] font-medium uppercase tracking-widest px-2 py-1 rounded">
                                {{ $work->category->value }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-foreground-secondary text-sm">
                            {{ $work->publishedAt ?? '-' }}
                        </td>
                        <td class="px-6 py-4 text-foreground-secondary text-sm">
                            {{ $work->sortOrder }}
                        </td>
                        <td class="px-6 py-4 text-sm">
                            @if ($work->isFeatured)
                                <span class="text-accent-primary">&#x2713;</span>
                            @else
                                <span class="text-foreground-muted">-</span>
                            @endif
                        </td>
                        <td class="px-6 py-4 text-right">
                            <div class="flex justify-end gap-3">
                                <a href="{{ route('admin.works.edit', $work->id) }}"
                                   class="text-accent-primary text-xs hover:text-accent-secondary transition-colors">
                                    edit
                                </a>
                                {{--
                                    🎓【穴埋め問題 11】@method ディレクティブ
                                    ──────────────────────────────────
                                    HTMLフォームは GET と POST しかサポートしていません。
                                    Laravel では @method('DELETE') で擬似的に
                                    DELETE リクエストを送信できます。
                                    これは隠しフィールド _method=DELETE を追加します。
                                --}}
                                <form action="{{ route('admin.works.destroy', $work->id) }}" method="POST" class="inline">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit"
                                            class="text-red-500 text-xs hover:text-red-700 transition-colors"
                                            onclick="return confirm('本当に削除しますか？')">
                                        delete
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

@endsection
