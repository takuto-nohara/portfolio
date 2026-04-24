@extends('layouts.auth')

@section('title', '管理画面ログイン - TN_ Portfolio')

@section('content')
    <section class="flex w-full max-w-110 flex-col items-center rounded-2xl border border-border-subtle bg-surface-primary px-10 py-12 gap-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <p class="font-bold text-accent-primary text-[36px] leading-[1.333] tracking-[0.12em]" style="font-family: 'Playfair Display', serif;">TN</p>

        <div class="space-y-3 text-center">
            <h1 class="font-semibold text-foreground-primary text-[22px] leading-8">管理画面ログイン</h1>
            <p class="text-sm leading-6 text-foreground-secondary">メールアドレスとパスワードを入力してください</p>
        </div>

        @if (session('status'))
            <div class="w-full rounded border border-border-subtle bg-surface-secondary px-4 py-3 text-sm text-foreground-secondary">
                {{ session('status') }}
            </div>
        @endif

        <form id="login-form" method="POST" action="{{ route('login') }}" class="flex w-full flex-col gap-5">
            @csrf

            <div class="flex flex-col gap-1.5">
                <label for="email" class="font-medium text-foreground-primary text-[13px]">メールアドレス</label>
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
                <label for="password" class="font-medium text-foreground-primary text-[13px]">パスワード</label>
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

            <label class="flex w-full items-center gap-2 text-foreground-secondary text-[13px]">
                <input type="checkbox" name="remember" class="h-4.5 w-4.5 rounded border border-border-subtle bg-surface-primary text-accent-primary focus:ring-accent-primary">
                <span>ログイン状態を保持する</span>
            </label>
        </form>

        <button type="submit" form="login-form" class="flex h-12 w-full items-center justify-center rounded bg-accent-primary font-semibold text-[15px] text-surface-primary transition-colors hover:bg-accent-secondary">
            ログイン
        </button>

        <a href="{{ route('top') }}" class="text-[13px] text-accent-primary transition-colors hover:text-accent-secondary">← サイトに戻る</a>
    </section>
@endsection
