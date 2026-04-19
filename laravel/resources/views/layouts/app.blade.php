<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'TN_ Portfolio')</title>

    {{-- Google Fonts --}}
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=jetbrains-mono:300,400,500,600,700" rel="stylesheet" />

    @vite([
        'resources/css/app.css',
        'resources/js/app.js'
    ])
</head>
<body class="bg-surface-primary text-foreground-primary font-mono min-h-screen flex flex-col">

    {{-- ナビゲーションバー --}}
    <header class="bg-surface-primary h-20 flex items-center justify-between px-20 sticky top-0 z-50 border-b border-border-subtle/0 backdrop-blur-sm">
        <a href="{{ url('/') }}" class="text-foreground-primary text-[22px] font-medium tracking-wide hover:text-accent-primary transition-colors">
            &gt; TN_
        </a>
        <nav class="flex items-center gap-10">
            <a href="{{ route('works.index') }}" class="text-foreground-secondary text-[13px] hover:text-accent-primary transition-colors">works()</a>
            <a href="{{ route('about') }}" class="text-foreground-secondary text-[13px] hover:text-accent-primary transition-colors">about()</a>
            <a href="{{ route('contact.index') }}" class="text-foreground-secondary text-[13px] hover:text-accent-primary transition-colors">contact()</a>
        </nav>
    </header>

    {{-- メインコンテンツ --}}
    <main class="flex-1">
        @yield('content')
    </main>

    {{-- フッター --}}
    <footer class="bg-surface-secondary py-15 px-20 flex flex-col items-center gap-6">
        <span class="text-foreground-primary text-lg font-medium">&gt; TN_</span>
        <div class="flex items-center gap-8">
            <a href="#" class="text-foreground-muted text-xs hover:text-accent-primary transition-colors">github</a>
            <a href="#" class="text-foreground-muted text-xs hover:text-accent-primary transition-colors">email</a>
        </div>
        <p class="text-foreground-muted text-[11px]">&copy; 2025 Takuto Nohara. All rights reserved.</p>
    </footer>

</body>
</html>
