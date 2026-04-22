{{--
    ============================================================
    📄 管理画面 - サイト設定
    ============================================================
--}}

@extends('layouts.admin')
@section('title', 'サイト設定 - Admin')
@section('header', '&gt; サイト設定')

@section('content')

    @if (session('success'))
        <div class="mb-6 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded">
            {{ session('success') }}
        </div>
    @endif

    <form action="{{ route('admin.settings.update') }}" method="POST">
        @csrf
        @method('PUT')

        <div class="bg-surface-primary rounded-lg border border-border-subtle p-8 space-y-8 max-w-2xl">

            {{-- GitHub URL --}}
            <div>
                <label for="github_url" class="block text-foreground-primary text-sm font-medium mb-2">
                    &gt; github_url
                </label>
                <input
                    type="url"
                    id="github_url"
                    name="github_url"
                    value="{{ old('github_url', $settings->get('github_url', '')) }}"
                    placeholder="https://github.com/yourname"
                    class="w-full bg-surface-secondary text-foreground-primary text-sm font-mono px-4 py-2.5 rounded border border-border-subtle focus:outline-none focus:border-accent-primary transition-colors"
                >
                @error('github_url')
                    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                @enderror
                <p class="text-foreground-muted text-xs mt-1">フッターの github リンク先として使用されます。</p>
            </div>

            {{-- Contact Email --}}
            <div>
                <label for="contact_email" class="block text-foreground-primary text-sm font-medium mb-2">
                    &gt; contact_email
                </label>
                <input
                    type="email"
                    id="contact_email"
                    name="contact_email"
                    value="{{ old('contact_email', $settings->get('contact_email', '')) }}"
                    placeholder="you@example.com"
                    class="w-full bg-surface-secondary text-foreground-primary text-sm font-mono px-4 py-2.5 rounded border border-border-subtle focus:outline-none focus:border-accent-primary transition-colors"
                >
                @error('contact_email')
                    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                @enderror
                <p class="text-foreground-muted text-xs mt-1">お問い合わせメールの送信先として使用されます。フッターの email リンク先にもなります。</p>
            </div>

            {{-- 保存ボタン --}}
            <div class="pt-4 border-t border-border-subtle flex justify-end">
                <button
                    type="submit"
                    class="bg-accent-primary text-surface-primary text-sm font-medium px-8 py-2 rounded hover:bg-accent-secondary transition-colors"
                >
                    &gt; save_settings
                </button>
            </div>

        </div>
    </form>

@endsection
