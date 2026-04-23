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

    {{-- ターミナルアニメーション用スタイル --}}
    <style>
        /* ============================================================
           Terminal Animations
           ============================================================ */

        /* --- スタートアニメーション オーバーレイ --- */
        #intro-overlay {
            position: fixed;
            inset: 0;
            background-color: #0C4A6E;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2rem;
            opacity: 1;
            transition: opacity 0.4s ease;
        }

        #intro-overlay.fade-out {
            opacity: 0;
            pointer-events: none;
        }

        .intro-terminal {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            min-width: min(480px, 85vw);
        }

        .intro-prompt {
            min-height: 1.7em;
            display: flex;
            align-items: baseline;
        }

        .intro-line {
            font-family: 'JetBrains Mono', ui-monospace, monospace;
            font-size: clamp(13px, 1.8vw, 15px);
            line-height: 1.7;
            color: #e0f2fe;
        }

        .intro-line.is-command {
            color: #0EA5E9;
        }

        .intro-skip {
            font-family: 'JetBrains Mono', ui-monospace, monospace;
            font-size: 11px;
            color: #7DD3FC;
            opacity: 0.65;
            letter-spacing: 0.05em;
        }

        /* --- ページ遷移オーバーレイ --- */
        #transition-overlay {
            position: fixed;
            inset: 0;
            background-color: #0C4A6E;
            z-index: 9998;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.12s ease;
        }

        #transition-overlay.active {
            opacity: 1;
            pointer-events: auto;
        }

        #transition-text {
            font-family: 'JetBrains Mono', ui-monospace, monospace;
            font-size: clamp(15px, 2.5vw, 20px);
            color: #0EA5E9;
        }

        /* --- ブロックカーソル (点滅) --- */
        .terminal-cursor {
            display: inline-block;
            width: 0.55em;
            height: 1.05em;
            background-color: #0EA5E9;
            vertical-align: text-bottom;
            margin-left: 1px;
            animation: terminal-cursor-blink 1s step-end infinite;
        }

        @keyframes terminal-cursor-blink {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0; }
        }

        /* --- ページ入場アニメーション --- */
        @keyframes page-enter {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0);   }
        }

        .page-enter {
            animation: page-enter 0.35s ease forwards;
        }

        /* --- prefers-reduced-motion 対応 --- */
        @media (prefers-reduced-motion: reduce) {
            #intro-overlay,
            #transition-overlay,
            .terminal-cursor,
            .page-enter {
                animation: none !important;
                transition: none !important;
            }
        }
    </style>
</head>
<body class="bg-surface-primary text-foreground-primary font-mono min-h-screen flex flex-col">

    {{-- ナビゲーションバー --}}
    <header class="bg-surface-primary h-20 flex items-center justify-between px-6 sm:px-20 sticky top-0 z-50 border-b border-border-subtle/0 backdrop-blur-sm">
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
    <footer class="bg-surface-secondary py-15 px-6 sm:px-20 flex flex-col items-center gap-6">
        <span class="text-foreground-primary text-lg font-medium">&gt; TN_</span>
        <div class="flex items-center gap-8">
            <a href="{{ \App\Models\Setting::get('github_url', '#') }}" target="_blank" rel="noopener noreferrer" class="text-foreground-muted text-xs hover:text-accent-primary transition-colors">github</a>
            <a href="mailto:{{ \App\Models\Setting::get('contact_email', '') }}" class="text-foreground-muted text-xs hover:text-accent-primary transition-colors">email</a>
        </div>
        <p class="text-foreground-muted text-[11px]">&copy; 2025 Takuto Nohara. All rights reserved.</p>
    </footer>
    {{-- スタートアニメーション (セッション初回ロード時のみ JS 側で表示) --}}
    <div id="intro-overlay" aria-hidden="true">
        <div class="intro-terminal">
            <div class="intro-prompt"><span id="intro-line-1" class="intro-line"></span></div>
            <div class="intro-prompt"><span id="intro-line-2" class="intro-line"></span></div>
            <div class="intro-prompt"><span id="intro-line-3" class="intro-line"></span></div>
        </div>
        <p class="intro-skip">click or press any key to skip</p>
    </div>

    {{-- ページ遷移オーバーレイ --}}
    <div id="transition-overlay" aria-hidden="true">
        <span id="transition-text"></span>
    </div>

    {{-- ターミナルアニメーション スクリプト --}}
    <script>
        (function () {
            'use strict';

            const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            /**
             * 要素内にテキストをタイプライター効果で追記する。
             * 入力中はブロックカーソルを末尾に付随させ、完了後のカーソル要素を返す。
             */
            async function typeInElement(el, text, speed) {
                if (!el?.isConnected) return null;
                const cursor = document.createElement('span');
                cursor.className = 'terminal-cursor';
                el.appendChild(cursor);
                for (const ch of text) {
                    if (!el.isConnected) { cursor.remove(); return null; }
                    cursor.insertAdjacentText('beforebegin', ch);
                    await sleep(speed);
                }
                return el.isConnected ? cursor : null;
            }

            document.addEventListener('DOMContentLoaded', async () => {
                const mainEl = document.querySelector('main');

                /* ---- ページ入場アニメーション ---- */
                if (!prefersReducedMotion && mainEl) {
                    mainEl.classList.add('page-enter');
                    mainEl.addEventListener('animationend', () => {
                        mainEl.classList.remove('page-enter');
                    }, { once: true });
                }

                /* ---- スタートアニメーション (セッション初回のみ) ---- */
                const introOverlay = document.getElementById('intro-overlay');

                if (introOverlay) {
                    if (prefersReducedMotion || sessionStorage.getItem('portfolio-intro-shown')) {
                        introOverlay.remove();
                    } else {
                        sessionStorage.setItem('portfolio-intro-shown', '1');

                        const line1El = document.getElementById('intro-line-1');
                        const line2El = document.getElementById('intro-line-2');
                        const line3El = document.getElementById('intro-line-3');
                        let dismissed = false;

                        const dismiss = () => {
                            if (dismissed) return;
                            dismissed = true;
                            introOverlay.classList.add('fade-out');
                            setTimeout(() => introOverlay?.remove(), 420);
                        };

                        introOverlay.addEventListener('click', dismiss, { once: true });
                        document.addEventListener('keydown', dismiss, { once: true });

                        // Line 1: コマンド行
                        line1El?.classList.add('is-command');
                        const c1 = await typeInElement(line1El, '$ ./portfolio --start', 30);
                        c1?.remove();
                        if (dismissed) return;
                        await sleep(100);

                        // Line 2: 出力行
                        if (dismissed) return;
                        const c2 = await typeInElement(line2El, '> Loading TN_ Portfolio...', 30);
                        c2?.remove();
                        if (dismissed) return;
                        await sleep(100);

                        // Line 3: 完了行
                        if (dismissed) return;
                        await typeInElement(line3El, '> Welcome.', 30);
                        if (dismissed) return;

                        await sleep(480);
                        dismiss();
                    }
                }

                /* ---- ページ遷移アニメーション ---- */
                if (prefersReducedMotion) return;

                const transitionOverlay = document.getElementById('transition-overlay');
                const transitionTextEl  = document.getElementById('transition-text');
                if (!transitionOverlay || !transitionTextEl) return;

                const getLabel = (href) => {
                    try {
                        const path = new URL(href, location.origin).pathname;
                        return path === '/' ? '~' : path.replace(/^\/+|\/+$/g, '');
                    } catch { return href; }
                };

                document.querySelectorAll('a[href]').forEach((link) => {
                    const href = link.getAttribute('href') ?? '';
                    if (!href || href.startsWith('#') || href.startsWith('mailto:')) return;
                    try {
                        const url = new URL(link.href);
                        if (url.origin !== location.origin) return;
                        if (url.pathname.includes('/admin') || url.pathname.includes('/login') || url.pathname.includes('/logout')) return;
                    } catch { return; }

                    link.addEventListener('click', async (e) => {
                        e.preventDefault();
                        transitionTextEl.textContent = '';
                        transitionOverlay.classList.add('active');
                        await typeInElement(transitionTextEl, `$ cd ${getLabel(link.href)}`, 28);
                        await sleep(80);
                        window.location.href = link.href;
                    });
                });
            });
        })();
    </script>

    @stack('scripts')

</body>
</html>
