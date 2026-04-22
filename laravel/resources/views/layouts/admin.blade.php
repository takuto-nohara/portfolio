<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Admin - TN_ Portfolio')</title>

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=jetbrains-mono:300,400,500,600,700" rel="stylesheet" />

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-surface-secondary text-foreground-primary font-mono min-h-screen flex">

    {{-- ==================== Sidebar ==================== --}}
    <aside class="w-64 bg-foreground-primary min-h-screen flex flex-col py-8 px-6 shrink-0">
        {{-- ロゴ --}}
        <a href="{{ url('/') }}" class="text-surface-primary text-lg font-medium tracking-wide mb-12">
            &gt; TN_
        </a>

        {{-- ナビゲーション --}}
        <nav class="flex flex-col gap-2 flex-1">
            <a href="{{ route('admin.works.index') }}"
               class="text-surface-primary/70 text-sm px-3 py-2 rounded hover:bg-surface-primary/10 hover:text-surface-primary transition-colors
                      {{ request()->routeIs('admin.works.*') ? 'bg-surface-primary/10 text-surface-primary' : '' }}">
                &gt; 制作物管理
            </a>
            <a href="{{ route('admin.contacts.index') }}"
               class="text-surface-primary/70 text-sm px-3 py-2 rounded hover:bg-surface-primary/10 hover:text-surface-primary transition-colors
                      {{ request()->routeIs('admin.contacts.*') ? 'bg-surface-primary/10 text-surface-primary' : '' }}">
                &gt; お問い合わせ
            </a>
        </nav>

        {{-- ログアウト --}}
        <form action="{{ route('logout') }}" method="POST">
            @csrf
            <button type="submit" class="text-surface-primary/50 text-xs px-3 py-2 hover:text-surface-primary transition-colors">
                &gt; logout
            </button>
        </form>
    </aside>

    {{-- ==================== Main Content ==================== --}}
    <div class="flex-1 flex flex-col">
        {{-- ヘッダー --}}
        <header class="bg-surface-primary h-16 flex items-center justify-between px-8 border-b border-border-subtle">
            <h1 class="text-foreground-primary text-base font-semibold">@yield('header', 'Dashboard')</h1>
        </header>

        {{-- コンテンツ --}}
        <main class="flex-1 p-8">
            @yield('content')
        </main>
    </div>

</body>
</html>
