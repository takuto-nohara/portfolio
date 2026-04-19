{{--
    ============================================================
    📄 お問い合わせページ (Contact)
    ============================================================
    design.pen の Contact Page デザインを模倣。
    Hero → Contact Form の構成。
--}}

@extends('layouts.app')
@section('title', 'Contact - TN_ Portfolio')

@section('content')

    {{-- ==================== Hero Section ==================== --}}
    <section class="bg-surface-secondary px-20 py-20 text-center">
        <h1 class="text-foreground-primary text-[40px] font-bold">&gt; Get in Touch</h1>
    </section>

    {{-- ==================== Contact Form Section ==================== --}}
    <section class="bg-surface-primary px-20 py-16">
        <div class="max-w-xl mx-auto">

            {{--
                🎓【穴埋め問題 9】フォームの基本構造
                ──────────────────────────────────
                LaravelのフォームではPOSTメソッドを使い、
                @csrf ディレクティブでCSRFトークンを自動挿入します。
                これはセキュリティ対策（クロスサイトリクエストフォージェリ防止）です。

                action属性には route('contact.store') を指定し、
                ContactController@store メソッドにデータを送信します。
            --}}
            <form method="POST" action="{{ route('contact.store') }}" class="space-y-8">
                @csrf

                {{-- 成功メッセージ --}}
                @if (session('success'))
                    <div class="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded">
                        {{ session('success') }}
                    </div>
                @endif

                {{--
                    🎓【穴埋め問題 10】バリデーションエラーの表示
                    ──────────────────────────────────
                    @error('フィールド名') で、バリデーションエラーを検出し
                    $message 変数でエラーメッセージを表示できます。

                    構文: @error('name') <p>{{ $message }}</p> @enderror
                --}}

                {{-- Name フィールド --}}
                <div>
                    <label for="name" class="block text-foreground-primary text-sm font-medium mb-2">
                        &gt; name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value="{{ old('name') }}"
                        required
                        class="w-full bg-surface-secondary border border-border-subtle rounded px-4 py-3 text-foreground-primary text-sm font-mono
                               focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors
                               @error('name') border-red-400 @enderror"
                        placeholder="your_name"
                    >
                    @error('name')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                {{-- Email フィールド --}}
                <div>
                    <label for="email" class="block text-foreground-primary text-sm font-medium mb-2">
                        &gt; email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value="{{ old('email') }}"
                        required
                        class="w-full bg-surface-secondary border border-border-subtle rounded px-4 py-3 text-foreground-primary text-sm font-mono
                               focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors
                               @error('email') border-red-400 @enderror"
                        placeholder="your@email.com"
                    >
                    @error('email')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                {{-- Message フィールド --}}
                <div>
                    <label for="message" class="block text-foreground-primary text-sm font-medium mb-2">
                        &gt; message
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        rows="6"
                        required
                        class="w-full bg-surface-secondary border border-border-subtle rounded px-4 py-3 text-foreground-primary text-sm font-mono resize-none
                               focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors
                               @error('message') border-red-400 @enderror"
                        placeholder="write_your_message_here..."
                    >{{ old('message') }}</textarea>
                    @error('message')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                {{-- 送信ボタン --}}
                <button type="submit"
                        class="w-full bg-accent-primary text-surface-primary text-sm font-medium py-3 rounded
                               hover:bg-accent-secondary transition-colors">
                    &gt; submit_request
                </button>
            </form>
        </div>
    </section>

@endsection
