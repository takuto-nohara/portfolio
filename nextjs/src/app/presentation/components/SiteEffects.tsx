"use client";

import { useEffect } from "react";

const LINE_RGB = "14, 165, 233";
const DOT_COLORS = [
  [14, 165, 233],
  [2, 132, 199],
  [56, 189, 248],
  [125, 211, 252],
] as const;
const MAX_DIST = 170;
const BASE_SPEED = 0.42;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: readonly [number, number, number];
  alpha: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function SiteEffects() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeoutIds: number[] = [];
    const cleanupCallbacks: Array<() => void> = [];

    const schedule = (callback: () => void, ms: number) => {
      const timeoutId = window.setTimeout(callback, ms);
      timeoutIds.push(timeoutId);
      return timeoutId;
    };

    const triggerHeroItems = () => {
      if (prefersReducedMotion) {
        return;
      }

      document.querySelectorAll<HTMLElement>(".hero-item").forEach((element) => {
        const delay = Number.parseInt(element.dataset.delay ?? "0", 10);
        schedule(() => element.classList.add("is-visible"), Number.isNaN(delay) ? 0 : delay);
      });
    };

    const initHeroCanvas = () => {
      const canvas = document.getElementById("hero-canvas") as HTMLCanvasElement | null;

      if (!canvas || prefersReducedMotion) {
        return;
      }

      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      let particles: Particle[] = [];
      let width = 0;
      let height = 0;
      let animationFrameId = 0;
      let resizeTimeoutId = 0;

      const resize = () => {
        const devicePixelRatio = window.devicePixelRatio || 1;
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
        context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      };

      const createParticle = (): Particle => {
        const color = DOT_COLORS[Math.floor(Math.random() * DOT_COLORS.length)];
        const angle = Math.random() * Math.PI * 2;
        const speed = BASE_SPEED * (0.5 + Math.random());

        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: Math.random() * 2.8 + 1.4,
          color,
          alpha: 0.55 + Math.random() * 0.35,
        };
      };

      const init = () => {
        resize();
        const count = Math.max(45, Math.floor((width * height) / 12000));
        particles = Array.from({ length: Math.min(count, 100) }, createParticle);
      };

      const drawFrame = () => {
        context.clearRect(0, 0, width, height);

        for (let index = 0; index < particles.length; index += 1) {
          for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
            const dx = particles[index].x - particles[nextIndex].x;
            const dy = particles[index].y - particles[nextIndex].y;
            const distanceSquared = dx * dx + dy * dy;

            if (distanceSquared < MAX_DIST * MAX_DIST) {
              const ratio = 1 - Math.sqrt(distanceSquared) / MAX_DIST;
              context.beginPath();
              context.moveTo(particles[index].x, particles[index].y);
              context.lineTo(particles[nextIndex].x, particles[nextIndex].y);
              context.strokeStyle = `rgba(${LINE_RGB}, ${(ratio * 0.38).toFixed(3)})`;
              context.lineWidth = 1;
              context.stroke();
            }
          }
        }

        for (const particle of particles) {
          const [red, green, blue] = particle.color;
          context.beginPath();
          context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
          context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${particle.alpha})`;
          context.fill();
        }
      };

      const tick = () => {
        for (const particle of particles) {
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x < -8) {
            particle.x = width + 8;
          } else if (particle.x > width + 8) {
            particle.x = -8;
          }

          if (particle.y < -8) {
            particle.y = height + 8;
          } else if (particle.y > height + 8) {
            particle.y = -8;
          }
        }
      };

      const loop = () => {
        tick();
        drawFrame();
        animationFrameId = window.requestAnimationFrame(loop);
      };

      const onResize = () => {
        if (resizeTimeoutId) {
          window.clearTimeout(resizeTimeoutId);
        }

        resizeTimeoutId = schedule(() => {
          window.cancelAnimationFrame(animationFrameId);
          init();
          loop();
        }, 200);
      };

      window.addEventListener("resize", onResize);
      cleanupCallbacks.push(() => {
        window.removeEventListener("resize", onResize);
        window.cancelAnimationFrame(animationFrameId);
        if (resizeTimeoutId) {
          window.clearTimeout(resizeTimeoutId);
        }
      });

      init();
      loop();
    };

    const typeInElement = async (element: HTMLElement | null, text: string, speed: number) => {
      if (!element?.isConnected) {
        return null;
      }

      const cursor = document.createElement("span");
      cursor.className = "terminal-cursor";
      element.appendChild(cursor);

      for (const character of text) {
        if (!element.isConnected) {
          cursor.remove();
          return null;
        }

        cursor.insertAdjacentText("beforebegin", character);
        await sleep(speed);
      }

      return element.isConnected ? cursor : null;
    };

    const mainElement = document.querySelector<HTMLElement>("main[data-site-main='true']");
    initHeroCanvas();

    const isTransitionArrival =
      !prefersReducedMotion && !!window.sessionStorage.getItem("portfolio-transition-active");
    if (isTransitionArrival) {
      window.sessionStorage.removeItem("portfolio-transition-active");
    }

    if (!prefersReducedMotion && mainElement) {
      const addPageEnter = () => {
        mainElement.classList.add("page-enter");
        const onAnimationEnd = () => {
          mainElement.classList.remove("page-enter");
        };
        mainElement.addEventListener("animationend", onAnimationEnd, { once: true });
        cleanupCallbacks.push(() => mainElement.removeEventListener("animationend", onAnimationEnd));
      };

      if (isTransitionArrival) {
        const transitionOverlayEl = document.getElementById("transition-overlay");
        if (transitionOverlayEl) {
          // transition なしで即座に opacity:1 の状態にする
          transitionOverlayEl.style.transition = "none";
          transitionOverlayEl.classList.add("active");
          window.requestAnimationFrame(() => {
            // transition を元に戻し、フェードアウトを開始
            transitionOverlayEl.style.transition = "";
            schedule(() => {
              transitionOverlayEl.classList.remove("active");
            }, 30);
            // overlay フェードアウトと重ねてコンテンツをフェードイン
            schedule(addPageEnter, 120);
          });
        } else {
          addPageEnter();
        }
      } else {
        addPageEnter();
      }
    }

    const introOverlay = document.getElementById("intro-overlay");

    if (introOverlay) {
      if (prefersReducedMotion || window.sessionStorage.getItem("portfolio-intro-shown")) {
        introOverlay.remove();
        triggerHeroItems();
      } else {
        window.sessionStorage.setItem("portfolio-intro-shown", "1");
        const line1Element = document.getElementById("intro-line-1");
        const line2Element = document.getElementById("intro-line-2");
        const line3Element = document.getElementById("intro-line-3");
        let dismissed = false;

        const dismiss = () => {
          if (dismissed) {
            return;
          }

          dismissed = true;
          introOverlay.classList.add("fade-out");
          schedule(() => triggerHeroItems(), 200);
          schedule(() => introOverlay.remove(), 420);
        };

        const onOverlayClick = () => dismiss();
        const onKeyDown = () => dismiss();

        introOverlay.addEventListener("click", onOverlayClick, { once: true });
        document.addEventListener("keydown", onKeyDown, { once: true });
        cleanupCallbacks.push(() => {
          introOverlay.removeEventListener("click", onOverlayClick);
          document.removeEventListener("keydown", onKeyDown);
        });

        line1Element?.classList.add("is-command");

        void (async () => {
          const cursor1 = await typeInElement(line1Element, "$ ./portfolio --start", 30);
          cursor1?.remove();

          if (dismissed) {
            return;
          }

          await sleep(100);

          const cursor2 = await typeInElement(line2Element, "> Loading TN_ Portfolio...", 30);
          cursor2?.remove();

          if (dismissed) {
            return;
          }

          await sleep(100);
          await typeInElement(line3Element, "> Welcome.", 30);

          if (dismissed) {
            return;
          }

          await sleep(480);
          dismiss();
        })();
      }
    }

    if (!prefersReducedMotion) {
      const transitionOverlay = document.getElementById("transition-overlay");
      const transitionTextElement = document.getElementById("transition-text");

      if (transitionOverlay && transitionTextElement) {
        const getLabel = (href: string) => {
          try {
            const pathname = new URL(href, window.location.origin).pathname;
            return pathname === "/" ? "~" : pathname.replace(/^\/+|\/+$/g, "");
          } catch {
            return href;
          }
        };

        const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"));

        for (const link of links) {
          const href = link.getAttribute("href") ?? "";

          if (!href || href.startsWith("#") || href.startsWith("mailto:")) {
            continue;
          }

          try {
            const url = new URL(link.href);

            if (url.origin !== window.location.origin) {
              continue;
            }

            if (url.pathname.includes("/admin") || url.pathname.includes("/login") || url.pathname.includes("/logout")) {
              continue;
            }
          } catch {
            continue;
          }

          const onClick = (event: MouseEvent) => {
            event.preventDefault();
            transitionTextElement.textContent = "";
            transitionOverlay.classList.add("active");

            void (async () => {
              await typeInElement(transitionTextElement, `$ cd ${getLabel(link.href)}`, 28);
              await sleep(80);
              window.sessionStorage.setItem("portfolio-transition-active", "1");
              window.location.href = link.href;
            })();
          };

          link.addEventListener("click", onClick);
          cleanupCallbacks.push(() => link.removeEventListener("click", onClick));
        }
      }
    }

    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      cleanupCallbacks.forEach((callback) => callback());
    };
  }, []);

  return null;
}