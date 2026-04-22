@extends('layouts.auth')

@section('title', '管理画面ログイン - TN_ Portfolio')

@section('content')
	{{--
		Pencil 座標（cjjHQ 内相対）:
		  TN         y=48   h=48   → gap=32 →
		  タイトル   y=128  h=32   → gap=32 →
		  説明文     y=192  h=20   → gap=32 →
		  loginForm  y=244  h=197  → gap=32 →
		  loginBtn   y=473  h=48   → gap=32 →
		  footer     y=553  h=19   → padding-bottom=48
		card total h=620
	--}}
	<section
		class="w-full flex flex-col items-center rounded-lg border border-border-subtle bg-surface-primary py-12"
		style="max-width: 440px; padding-left: 40px; padding-right: 40px; gap: 32px;"
	>
		{{-- ロゴ --}}
		<p
			class="font-bold text-accent-primary"
			style="font-family: 'Playfair Display', serif; font-size: 36px; line-height: 1.333; letter-spacing: 2px;"
		>TN</p>

		{{-- タイトル --}}
		<h1
			class="font-semibold text-foreground-primary"
			style="font-family: 'Geist', sans-serif; font-size: 22px; line-height: 1.455;"
		>管理画面ログイン</h1>

		{{-- 説明文 --}}
		<p
			class="text-center font-normal text-foreground-secondary"
			style="font-family: 'Geist', sans-serif; font-size: 14px; line-height: 1.429;"
		>メールアドレスとパスワードを入力してください</p>

		{{-- ステータスメッセージ --}}
		@if (session('status'))
			<div
				class="w-full border border-border-subtle bg-surface-secondary px-4 py-3 text-sm text-foreground-secondary"
				style="font-family: 'Geist', sans-serif; border-radius: 2px;"
			>{{ session('status') }}</div>
		@endif

		{{-- フォーム (emailGroup + passGroup + rememberRow のみ) --}}
		<form
			id="login-form"
			method="POST"
			action="{{ route('login') }}"
			class="w-full flex flex-col"
			style="gap: 20px;"
		>
			@csrf

			{{-- メールアドレス --}}
			<div class="flex flex-col gap-1.5">
				<label
					for="email"
					class="font-medium text-foreground-primary"
					style="font-family: 'Geist', sans-serif; font-size: 13px;"
				>メールアドレス</label>
				<input
					id="email"
					name="email"
					type="email"
					value="{{ old('email') }}"
					required
					autocomplete="username"
					class="border border-border-subtle bg-surface-primary px-3.5 text-foreground-primary outline-none ring-0 focus:border-border-subtle focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
					style="font-family: 'Geist', sans-serif; font-size: 14px; border-radius: 4px; height: 44px; box-shadow: none;"
					placeholder="admin@example.com"
				>
				@error('email')
					<p class="text-[12px] text-red-500" style="font-family: 'Geist', sans-serif;">{{ $message }}</p>
				@enderror
			</div>

			{{-- パスワード --}}
			<div class="flex flex-col gap-1.5">
				<label
					for="password"
					class="font-medium text-foreground-primary"
					style="font-family: 'Geist', sans-serif; font-size: 13px;"
				>パスワード</label>
				<input
					id="password"
					name="password"
					type="password"
					required
					autocomplete="current-password"
					class="border border-border-subtle bg-surface-primary px-3.5 text-foreground-primary outline-none ring-0 focus:border-border-subtle focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
					style="font-family: 'Geist', sans-serif; font-size: 14px; border-radius: 4px; height: 44px; box-shadow: none;"
					placeholder="••••••••"
				>
				@error('password')
					<p class="text-[12px] text-red-500" style="font-family: 'Geist', sans-serif;">{{ $message }}</p>
				@enderror
			</div>

			{{-- ログイン状態を保持する --}}
			<label
				class="flex w-full items-center gap-2 text-foreground-secondary"
				style="font-family: 'Geist', sans-serif; font-size: 13px;"
			>
				<input
					type="checkbox"
					name="remember"
					class="border border-border-subtle bg-surface-primary text-accent-primary outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
					style="border-radius: 4px; width: 18px; height: 18px;"
				>
				<span>ログイン状態を保持する</span>
			</label>
		</form>

		{{-- ログインボタン (フォームの外 → gap=32 で区切られる) --}}
		<button
			type="submit"
			form="login-form"
			class="flex w-full items-center justify-center bg-accent-primary text-surface-primary transition-colors hover:bg-accent-secondary"
			style="font-family: 'Geist', sans-serif; border-radius: 4px; height: 48px; font-size: 15px; font-weight: 600;"
		>ログイン</button>

		{{-- フッターリンク --}}
		<a
			href="{{ route('top') }}"
			class="text-accent-primary hover:text-accent-secondary"
			style="font-family: 'Geist', sans-serif; font-size: 13px;"
		>← サイトに戻る</a>
	</section>
@endsection
