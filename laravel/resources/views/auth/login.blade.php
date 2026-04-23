@extends('layouts.auth')

@section('title', '管理画面ログイン - TN_ Portfolio')

@section('content')
    <section class="flex w-full flex-col items-center rounded-2xl border border-border-subtle bg-surface-primary py-12" style="max-width: 440px; padding-left: 40px; padding-right: 40px; gap: 32px; box-shadow: 0 30px 80px rgba(15,23,42,0.08);">
        <p class="font-bold text-accent-primary" style="font-family: 'Playfair Display', serif; font-size: 36px; line-height: 1.333; letter-spacing: 0.12em;">TN</p>

        <div class="space-y-3 text-center" style="font-family: 'Geist', sans-serif;">
            <h1 class="font-semibold text-foreground-primary" style="font-size: 22px; line-height: 2rem;">管理画面ログイン</h1>
            <p class="text-sm leading-6 text-foreground-secondary">メールアドレスとパスワードを入力してください</p>
        </div>

        @if (session('status'))
            <div class="w-full rounded border border-border-subtle bg-surface-secondary px-4 py-3 text-sm text-foreground-secondary" style="font-family: 'Geist', sans-serif;">
                {{ session('status') }}
            </div>
        @endif

        <form id="login-form" method="POST" action="{{ route('login') }}" class="flex w-full flex-col gap-5" style="font-family: 'Geist', sans-serif;">
            @csrf

            <div class="flex flex-col gap-1.5">
                <label for="email" class="font-medium text-foreground-primary" style="font-size: 13px;">メールアドレス</label>
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
                <label for="password" class="font-medium text-foreground-primary" style="font-size: 13px;">パスワード</label>
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

            <label class="flex w-full items-center gap-2 text-foreground-secondary" style="font-size: 13px;">
                <input type="checkbox" name="remember" class="rounded border border-border-subtle bg-surface-primary text-accent-primary focus:ring-accent-primary" style="height: 18px; width: 18px;">
                <span>ログイン状態を保持する</span>
            </label>
        </form>

        <button type="submit" form="login-form" class="flex h-12 w-full items-center justify-center rounded bg-accent-primary font-semibold text-surface-primary transition-colors hover:bg-accent-secondary" style="font-size: 15px; font-family: 'Geist', sans-serif;">
            ログイン
        </button>

        <a href="{{ route('top') }}" class="text-accent-primary transition-colors hover:text-accent-secondary" style="font-size: 13px; font-family: 'Geist', sans-serif;">← サイトに戻る</a>
    </section>
@endsection
