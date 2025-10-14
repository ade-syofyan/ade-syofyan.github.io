// File: assets/js/generative-art.js
function initializeGenerativeArt() {
  const DEBUG = true;
  const LOG_PREFIX = "[ParticleFlow]";
  const log = (...a) => DEBUG && console.log(LOG_PREFIX, ...a);
  const warn = (...a) => console.warn(LOG_PREFIX, ...a);
  const error = (...a) => console.error(LOG_PREFIX, ...a);

  try {
    // Pastikan SimplexNoise sudah siap (mis. dari CDN)
    if (typeof SimplexNoise === "undefined") {
      warn("SimplexNoise belum tersedia. Coba lagi sebentar...");
      setTimeout(initializeGenerativeArt, 100);
      return;
    }

    // Ambil semua container demo Interactive Particle Flow di halaman
    const demoEls = document.querySelectorAll(
      '[data-demo-id="generative-art"]'
    );
    if (!demoEls.length) {
      warn('Container [data-demo-id="generative-art"] tidak ditemukan.');
      return;
    }

    // Resolve CSS custom properties sekali (untuk warna canvas)
    const css = getComputedStyle(document.documentElement);
    const bgRGB = (
      css.getPropertyValue("--bg-primary-rgb") || "26, 32, 44"
    ).trim();
    const accentRGB = (
      css.getPropertyValue("--color-accent-rgb") || "99, 179, 237"
    ).trim();

    log(
      `Inisialisasi pada ${demoEls.length} container. BG=${bgRGB} Accent=${accentRGB}`
    );

    demoEls.forEach((demoEl, idx) => {
      const tag = `#${idx + 1}`;
      console.groupCollapsed(`${LOG_PREFIX} ${tag} init`);

      // --- Query elemen di-scope ke tiap demoEl ---
      const canvas = demoEl.querySelector("#particle-canvas");
      const countSlider = demoEl.querySelector("#particle-count");
      const speedSlider = demoEl.querySelector("#particle-speed");
      const noiseSlider = demoEl.querySelector("#noise-scale");
      const startStopButton = demoEl.querySelector("#start-stop-particles-btn");
      // clear bisa bernama clear atau reset, dukung dua-duanya
      const clearButton =
        demoEl.querySelector("#clear-particles-btn") ||
        demoEl.querySelector("#reset-particles-btn");

      const present = {
        canvas: !!canvas,
        countSlider: !!countSlider,
        speedSlider: !!speedSlider,
        noiseSlider: !!noiseSlider,
        startStopButton: !!startStopButton,
        clearButton: !!clearButton,
      };
      console.table(present);

      if (
        !canvas ||
        !countSlider ||
        !speedSlider ||
        !noiseSlider ||
        !startStopButton
      ) {
        warn(
          `${tag} Elemen demo tidak lengkap. Batal init untuk container ini.`
        );
        console.groupEnd();
        return;
      }

      const ctx = canvas.getContext("2d", { alpha: true });
      const simplex = new SimplexNoise();

      // --- State per instance ---
      let particles = [];
      let animationFrameId = null;
      let isAnimating = false;
      let time = Math.random() * 1000;
      const mouse = { x: null, y: null, radius: 120 };

      // FPS meter (ringan)
      let frameCount = 0;
      let lastFpsT = performance.now();

      // --- Setup kanvas dengan DPR & guard ukuran 0 ---
      function setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        if (rect.width === 0 || rect.height === 0) {
          warn(
            `${tag} Canvas size 0x0. Cek CSS container (mis. 'aspect-video' / height).`,
            { rect }
          );
          return false;
        }

        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        canvas.style.width = rect.width + "px";
        canvas.style.height = rect.height + "px";

        log(`${tag} setupCanvas() w=${rect.width} h=${rect.height} dpr=${dpr}`);
        return true;
      }

      // --- Particle class ---
      class Particle {
        constructor() {
          this.reset();
          this.size = Math.random() * 1.5 + 0.5;
          const a = Math.random() * 0.5 + 0.4; // alpha 0.4 - 0.9
          this.color = `rgba(${accentRGB}, ${a.toFixed(2)})`;
        }
        reset() {
          const r = canvas.getBoundingClientRect();
          this.x = Math.random() * r.width;
          this.y = Math.random() * r.height;
          this.vx = 0;
          this.vy = 0;
        }
        update(speed, noiseScale) {
          const angle =
            simplex.noise3D(this.x * noiseScale, this.y * noiseScale, time) *
            Math.PI *
            2;
          this.vx += Math.cos(angle) * speed;
          this.vy += Math.sin(angle) * speed;

          // Interaksi mouse (repel)
          if (mouse.x !== null) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius && dist > 0.0001) {
              const force = (mouse.radius - dist) / mouse.radius;
              this.vx += (dx / dist) * force * 2.5;
              this.vy += (dy / dist) * force * 2.5;
            }
          }

          // Friksi
          this.vx *= 0.96;
          this.vy *= 0.96;

          // Integrate
          this.x += this.vx;
          this.y += this.vy;

          // Wrap / respawn jika keluar area
          const r = canvas.getBoundingClientRect();
          if (
            this.x > r.width + 5 ||
            this.x < -5 ||
            this.y > r.height + 5 ||
            this.y < -5
          ) {
            this.reset();
          }
        }
        draw() {
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // --- Particles init ---
      function initParticles() {
        particles = [];
        const n = parseInt(countSlider.value, 10);
        if (Number.isNaN(n)) {
          warn(`${tag} countSlider.value bukan angka. fallback = 150`);
        }
        const count = Number.isNaN(n) ? 150 : n;
        for (let i = 0; i < count; i++) particles.push(new Particle());
        log(`${tag} initParticles() -> ${particles.length} partikel`);
      }

      // --- Loop animasi ---
      function animate() {
        if (!isAnimating) return;

        try {
          const r = canvas.getBoundingClientRect();

          // Soft clear (trail effect) pakai ukuran CSS pixel
          ctx.fillStyle = `rgba(${bgRGB}, 0.1)`;
          ctx.fillRect(0, 0, r.width, r.height);

          const sp = parseFloat(speedSlider.value);
          const ns = parseFloat(noiseSlider.value);
          const speed = Number.isFinite(sp) ? sp : 0.6;
          const noiseScale = Number.isFinite(ns) ? ns : 0.004;

          for (let i = 0; i < particles.length; i++) {
            particles[i].update(speed, noiseScale);
            particles[i].draw();
          }

          time += 0.002;
          animationFrameId = requestAnimationFrame(animate);

          // FPS log (sekitar tiap 1 detik)
          frameCount++;
          const now = performance.now();
          if (now - lastFpsT > 1000) {
            const fps = Math.round((frameCount * 1000) / (now - lastFpsT));
            log(
              `${tag} FPS ≈ ${fps}, particles=${particles.length}, speed=${speed}, noise=${noiseScale}`
            );
            frameCount = 0;
            lastFpsT = now;
          }
        } catch (e) {
          error(`${tag} Error dalam animate():`, e);
          stopAnimation();
        }
      }

      // --- Controls ---
      function setButtonPlayingUI(playing) {
        if (!startStopButton) return;
        if (playing) {
          startStopButton.innerHTML = `<i data-lucide="pause" class="w-4 h-4 mr-2"></i><span>Stop</span>`;
        } else {
          startStopButton.innerHTML = `<i data-lucide="play" class="w-4 h-4 mr-2"></i><span>Start</span>`;
        }
        // Optional: jika lucide tersedia
        if (typeof lucide !== "undefined" && lucide?.createIcons) {
          try {
            lucide.createIcons();
          } catch (e) {
            warn(`${tag} lucide.createIcons error`, e);
          }
        }
      }

      function startAnimation() {
        if (isAnimating) return;

        const ready = setupCanvas();
        if (!ready) {
          // Jika kanvas belum punya ukuran (mis. masih 0x0), coba lagi frame berikutnya
          requestAnimationFrame(startAnimation);
          return;
        }

        if (particles.length === 0) initParticles();
        isAnimating = true;
        setButtonPlayingUI(true);
        log(`${tag} START`);
        animate();
      }

      function stopAnimation() {
        if (!isAnimating) return;
        isAnimating = false;
        setButtonPlayingUI(false);
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        log(`${tag} STOP`);
      }

      // Panggil sekali di awal untuk set UI tombol ke state "stopped"
      setButtonPlayingUI(false);

      function clearAndReset() {
        stopAnimation();
        particles = [];
        const r = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, r.width, r.height);
        log(`${tag} CLEAR`);
      }

      // --- Event listeners (scoped ke instance) ---
      startStopButton.addEventListener("click", () => {
        log(`${tag} Click start/stop`);
        if (isAnimating) stopAnimation();
        else startAnimation();
      });

      if (clearButton) {
        clearButton.addEventListener("click", clearAndReset);
      }

      countSlider.addEventListener("input", () => {
        const target = parseInt(countSlider.value, 10);
        if (!Number.isFinite(target)) {
          warn(`${tag} countSlider input bukan angka:`, countSlider.value);
          return;
        }
        const diff = target - particles.length;
        if (diff > 0)
          for (let i = 0; i < diff; i++) particles.push(new Particle());
        else if (diff < 0) particles.splice(0, -diff);
        log(`${tag} countSlider=${target} -> particles=${particles.length}`);
      });

      speedSlider.addEventListener("input", () => {
        log(`${tag} speedSlider=${speedSlider.value}`);
      });

      noiseSlider.addEventListener("input", () => {
        log(`${tag} noiseSlider=${noiseSlider.value}`);
      });

      canvas.addEventListener("mousemove", (e) => {
        const r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
      });
      canvas.addEventListener("mouseleave", () => {
        mouse.x = null;
        mouse.y = null;
      });

      // Hanya pause saat keluar viewport; tidak auto-start
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            log(`${tag} viewport isIntersecting=${entry.isIntersecting}`);
            if (!entry.isIntersecting && isAnimating) {
              stopAnimation();
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(demoEl);

      // Resize (debounce) per instance
      let resizeTimeout;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          if (isAnimating) {
            const ok = setupCanvas();
            log(`${tag} resize -> setupCanvas()=${ok}`);
          }
        }, 200);
      });

      console.groupEnd();
    });

    // Tangkap error yang tidak tertangani
    window.addEventListener("error", (ev) => {
      error(
        "window.onerror:",
        ev.message,
        ev.filename,
        ev.lineno,
        ev.colno,
        ev.error
      );
    });
    window.addEventListener("unhandledrejection", (ev) => {
      error("unhandledrejection:", ev.reason);
    });
  } catch (e) {
    error("Fatal error saat initializeGenerativeArt():", e);
  }
}
