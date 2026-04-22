@extends('layouts.auth')

@section('title', '管理画面ログイン - TN_ Portfolio')

@section('content')
    <section class="flex w-full max-w-[440px] flex-col items-center gap-8 rounded-2xl border border-border-subtle bg-surface-primary px-10 py-12 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <p class="[font-family:'Playfair_Display',serif] text-4xl font-bold leading-none tracking-[0.12em] text-accent-primary">TN</p>

        <div class="space-y-3 text-center [font-family:'Geist',sans-serif]">
            <h1 class="text-[22px] font-semibold leading-8 text-foreground-primary">管理画面ログイン</h1>
            <p class="text-sm leading-6 text-foreground-secondary">メールアドレスとパスワードを入力してください</p>
        </div>

        @if (session('status'))
            <div class="w-full rounded border border-border-subtle bg-surface-secondary px-4 py-3 text-sm text-foreground-secondary [font-family:'Geist',sans-serif]">
                {{ session('status') }}
            </div>
        @endif

        <form id="login-form" method="POST" action="{{ route('login') }}" class="flex w-full flex-col gap-5 [font-family:'Geist',sans-serif]">
            @csrf

            <div class="flex flex-col gap-1.5">
                <label for="email" class="text-[13px] font-medium text-foreground-primary">メールアドレス</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value="{{ old('email') }}"
                    required
                    autocomplete="username"
                    class="h-11 rounded border border-border-subtle bg-surface-primary px-3.5 text-sm text-foreground-primary outline-none transition-colors focus:border-accent-primary"
                    placeholder="admin@example.com"
                >
                @error('email')
                    <p class="text-xs text-red-500">{{ $message }}</p>
                @enderror
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="password" class="text-[13px] font-medium text-foreground-primary">パスワード</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autocomplete="current-password"
                    class="h-11 rounded border border-border-subtle bg-surface-primary px-3.5 text-sm text-foreground-primary outline-none transition-colors focus:border-accent-primary"
                    placeholder="••••••••"
                >
                @error('password')
                    <p class="text-xs text-red-500">{{ $message }}</p>
                @enderror
            </div>

            <label class="flex w-full items-center gap-2 text-[13px] text-foreground-secondary">
                <input type="checkbox" name="remember" class="h-[18px] w-[18px] rounded border border-border-subtle bg-surface-primary text-accent-primary focus:ring-accent-primary">
                <span>ログイン状態を保持する</span>
            </label>
        </form>

        <button type="submit" form="login-form" class="flex h-12 w-full items-center justify-center rounded bg-accent-primary text-[15px] font-semibold text-surface-primary transition-colors hover:bg-accent-secondary [font-family:'Geist',sans-serif]">
            ログイン
        </button>

        <a href="{{ route('top') }}" class="text-[13px] text-accent-primary transition-colors hover:text-accent-secondary [font-family:'Geist',sans-serif]">← サイトに戻る</a>
    </section>
@endsection
