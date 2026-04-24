(function () {
    'use strict';

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---- ヒーロー要素 stagger 入場 ---- */
    function triggerHeroItems() {
        if (prefersReducedMotion) return;
        document.querySelectorAll('.hero-item').forEach((el) => {
            const delay = parseInt(el.dataset.delay ?? '0');
            setTimeout(() => el.classList.add('is-visible'), delay);
        });
    }

    /* ---- ヒーローキャンバス : パーティクル星座アニメーション ---- */
    function initHeroCanvas() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas || prefersReducedMotion) return;

        const ctx = canvas.getContext('2d');
        const LINE_RGB   = '14, 165, 233';
        const DOT_COLORS = [
            [14, 165, 233],
            [2, 132, 199],
            [56, 189, 248],
            [125, 211, 252],
        ];
        const MAX_DIST   = 170;
        const BASE_SPEED = 0.42;
        let particles = [], W, H, rafId;

        function resize() {
            const dpr = window.devicePixelRatio || 1;
            W = canvas.offsetWidth;
            H = canvas.offsetHeight;
            canvas.width  = W * dpr;
            canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function makeParticle() {
            const color = DOT_COLORS[Math.floor(Math.random() * DOT_COLORS.length)];
            const angle = Math.random() * Math.PI * 2;
            const speed = BASE_SPEED * (0.5 + Math.random());
            return {
                x: Math.random() * W, y: Math.random() * H,
                vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                r: Math.random() * 2.8 + 1.4,
                color, alpha: 0.55 + Math.random() * 0.35,
            };
        }

        function init() {
            resize();
            const count = Math.max(45, Math.floor((W * H) / 12000));
            particles = Array.from({ length: Math.min(count, 100) }, makeParticle);
        }

        function drawFrame() {
            ctx.clearRect(0, 0, W, H);
            // 接続線
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < MAX_DIST * MAX_DIST) {
                        const ratio = 1 - Math.sqrt(d2) / MAX_DIST;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(${LINE_RGB}, ${(ratio * 0.38).toFixed(3)})`;
                        ctx.lineWidth = 1.0;
                        ctx.stroke();
                    }
                }
            }
            // ドット
            for (const p of particles) {
                const [r, g, b] = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
                ctx.fill();
            }
        }

        function tick() {
            for (const p of particles) {
                p.x += p.vx; p.y += p.vy;
                if (p.x < -8) p.x = W + 8; else if (p.x > W + 8) p.x = -8;
                if (p.y < -8) p.y = H + 8; else if (p.y > H + 8) p.y = -8;
            }
        }

        function loop() { tick(); drawFrame(); rafId = requestAnimationFrame(loop); }

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                cancelAnimationFrame(rafId);
                init(); loop();
            }, 200);
        });

        init();
        loop();
    }

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

        /* ---- ヒーローキャンバス初期化 ---- */
        initHeroCanvas();

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
                triggerHeroItems();
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
                    setTimeout(() => triggerHeroItems(), 200);
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
