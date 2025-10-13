// --- Plexus Animation Factory ---
// Helper untuk mengubah warna hex menjadi objek RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Helper untuk mengubah RGB ke HSL
function rgbToHsl(r, g, b) {
  (r /= 255), (g /= 255), (b /= 255);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h, s, l];
}
/**
 * Membuat instance animasi plexus pada elemen canvas yang diberikan.
 * @param {HTMLCanvasElement} canvas - Elemen canvas untuk digambar.
 * @param {object} options - Opsi kustomisasi (particleCount, maxDistance).
 */
function createPlexusInstance(canvas, options = {}) {
  if (!canvas) return null;

  const ctx = canvas.getContext("2d");
  let particles = [];
  const config = {
    particleCount: options.particleCount || 80,
    maxDistance: options.maxDistance || 150,
  };
  let themeColors = { r: 99, g: 179, b: 237 };
  let themeTextColor = { r: 226, g: 232, b: 240 };
  let interactionTriggered = false;
  let baseHue = 0.58; // Default hue untuk biru
  let animationFrameId = null; // Untuk kontrol loop animasi

  const mouse = {
    x: null,
    y: null,
    radius: 100,
  };

  function updateThemeColors() {
    const accentColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-accent")
      .trim();
    const textColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--text-primary")
      .trim();

    const accentRgb = hexToRgb(accentColor);
    if (accentRgb) {
      themeColors = accentRgb;
      baseHue = rgbToHsl(accentRgb.r, accentRgb.g, accentRgb.b)[0];
    }

    const textRgb = hexToRgb(textColor);
    if (textRgb) themeTextColor = textRgb;
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.originX = Math.random() * canvas.width;
      this.originY = Math.random() * canvas.height;
      this.x = this.originX;
      this.y = this.originY;
      this.baseSize = Math.random() * 2.5 + 1;
      this.size = this.baseSize;
      this.speedX = Math.random() * 0.4 - 0.2;
      this.speedY = Math.random() * 0.4 - 0.2;
      this.density = Math.random() * 30 + 1;
      this.angle = Math.random() * 360;

      // Warna dinamis berdasarkan tema
      const hue = baseHue + (Math.random() - 0.5) * 0.1; // Variasi hue
      const saturation = 0.7 + Math.random() * 0.3; // Saturasi tinggi
      const lightness = 0.5 + Math.random() * 0.2; // Terang
      this.color = `hsla(${hue * 360}, ${saturation * 100}%, ${
        lightness * 100
      }%, ${Math.random() * 0.5 + 0.3})`;
    }
    update() {
      // Efek "pernapasan" pada ukuran partikel
      this.angle += 0.02;
      this.size = this.baseSize + Math.sin(this.angle) * 0.5;

      // Gerakan acak
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
      if (this.y > canvas.height || this.y < 0) this.speedY *= -1;

      // Efek gravitasi kembali ke titik asal
      this.x += (this.originX - this.x) * 0.005;
      this.y += (this.originY - this.y) * 0.005;

      // Efek menjauh dari mouse (repulsion)
      if (mouse.x !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          const forceDirectionX = dx / distance || 0;
          const forceDirectionY = dy / distance || 0;
          const force = (mouse.radius - distance) / mouse.radius; // Kekuatan dorongan berbanding terbalik dengan jarak
          const moveX = forceDirectionX * force * this.density * 0.1;
          const moveY = forceDirectionY * force * this.density * 0.1;
          this.x += moveX;
          this.y += moveY;
        }
      }
    }
    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function init() {
    updateThemeColors();
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function connect() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a; b < particles.length; b++) {
        const distance = Math.sqrt(
          (particles[a].x - particles[b].x) ** 2 +
            (particles[a].y - particles[b].y) ** 2
        );
        if (distance < config.maxDistance) {
          const opacityValue = 1 - distance / config.maxDistance;
          ctx.strokeStyle = `rgba(${themeTextColor.r}, ${themeTextColor.g}, ${
            themeTextColor.b // Garis antar partikel lebih halus
          }, ${opacityValue * 0.3})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }

    // Menghubungkan partikel ke mouse
    if (mouse.x !== null) {
      for (let i = 0; i < particles.length; i++) {
        const distance = Math.sqrt(
          (particles[i].x - mouse.x) ** 2 + (particles[i].y - mouse.y) ** 2
        );
        if (distance < config.maxDistance) {
          const opacityValue = 1 - distance / config.maxDistance; // Garis ke mouse lebih tebal dan cerah
          ctx.strokeStyle = `rgba(${themeColors.r}, ${themeColors.g}, ${
            themeColors.b
          }, ${opacityValue * 0.8})`;
          ctx.lineWidth = 1.5;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    connect();
  }

  function stopAnimation() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  // Inisialisasi instance
  resizeCanvas();
  init();
  // Jangan langsung mulai, biarkan IntersectionObserver yang mengontrol
  // animate(); 

  // Pindahkan event listener ke elemen parent (section) agar tidak terhalang konten
  window.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    // Trigger achievement on first interaction with hero canvas
    if (canvas.id === "heroCanvas" && !interactionTriggered) {
      if (window.unlockAchievement) {
        unlockAchievement("animation_conductor");
      }
      interactionTriggered = true;
    }
  });

  window.addEventListener("mouseout", () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Mengembalikan fungsi untuk reinisialisasi saat ada perubahan global
  return {
    reinit: () => {
      resizeCanvas();
      init();
    },
    start: animate,
    stop: stopAnimation,
  };
}

// --- Inisialisasi Semua Animasi Plexus ---
function initializeHeroCanvas() {
  const canvas = document.querySelector(".plexus-canvas");
  if (!canvas) return;

  const plexusInstances = [];

  // --- OPTIMASI: Kurangi partikel jika pengguna meminta pengurangan gerakan ---
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const isMobile = window.innerWidth < 768;
  const options = {
    // Kurangi partikel secara signifikan jika ada preferensi atau di mobile
    particleCount: prefersReducedMotion ? 50 : isMobile ? 80 : 150,
    maxDistance: isMobile ? 90 : 120,
  };

  const instance = createPlexusInstance(canvas, options);
  if (instance) {
    plexusInstances.push(instance);
  }

  // --- OPTIMASI: Gunakan IntersectionObserver untuk menjeda animasi saat tidak terlihat ---
  const heroSection = document.querySelector(".hero-full-height");
  if (heroSection && instance) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            instance.start(); // Mulai animasi saat terlihat
          } else {
            instance.stop(); // Hentikan animasi saat tidak terlihat
          }
        });
      },
      { threshold: 0.01 }
    );
    observer.observe(heroSection);
  }

  // Handler global untuk resize dan perubahan tema
  const reinitAll = () => plexusInstances.forEach((inst) => inst.reinit());

  window.addEventListener("resize", reinitAll);

  const themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "data-theme") reinitAll();
    });
  });
  themeObserver.observe(document.documentElement, { attributes: true });
}

// --- Scroll-triggered Animations ---
function initializeScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    ".fade-in-on-scroll, #skills-grid, #services-grid, #workflowSteps, .fade-in-title, .live-demo" // Pastikan tidak ada koma atau tanda kurung yang salah di sini
  );
  if (animatedElements.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.15,
  };

  const observerCallback = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (
          entry.target.id === "skills-grid" ||
          entry.target.id === "services-grid"
        ) {
          const cards = entry.target.querySelectorAll(
            ".skill-card, .service-card"
          );
          cards.forEach((card, index) => {
            card.style.transitionDelay = `${index * 100}ms`;
            card.classList.add("animate");
          });
        } else if (entry.target.id === "workflowSteps") {
          const steps = entry.target.querySelectorAll(".workflow-step");
          steps.forEach((step) => {
            step.classList.add("animate");
          });
        } else {
          entry.target.classList.add("animate");
        }
        observer.unobserve(entry.target);
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);
  animatedElements.forEach((el) => observer.observe(el));
}

// --- Hero Subtitle Typing Effect ---
function initializeTypingEffect() {
  const subtitleElement = document.querySelector("#hero-subtitle .typing-text");
  if (!subtitleElement) {
    console.warn(
      "Elemen .typing-text tidak ditemukan. Animasi ketikan dibatalkan."
    );
    return;
  }

  const textsToType = [
    "Mobile & Web Developer dengan keahlian memecahkan masalah.",
    "Membangun solusi digital inovatif dari ide hingga implementasi.",
    "Spesialis dalam integrasi AI untuk efisiensi bisnis.",
    "Mahir dalam teknologi modern seperti Flutter, Laravel, dan Firebase.",
    "Berpengalaman lebih dari 7 tahun di industri teknologi.",
    "Mengembangkan solusi untuk sektor properti, otomotif, dan layanan publik.",
    "Spesialis dalam migrasi sistem backend untuk skalabilitas yang lebih baik.",
  ];

  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentText = textsToType[textIndex];
    let typeSpeed = 100;

    if (isDeleting) {
      typeSpeed = 50;
      subtitleElement.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
    } else {
      subtitleElement.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
    }

    if (!isDeleting && charIndex === currentText.length) {
      typeSpeed = 2000; // Jeda setelah selesai mengetik
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      typeSpeed = 500; // Jeda sebelum mengetik teks baru
      isDeleting = false;
      textIndex = (textIndex + 1) % textsToType.length;
    }

    setTimeout(type, typeSpeed);
  }

  // Mulai animasi setelah jeda singkat saat halaman dimuat
  setTimeout(type, 1500);
}

// --- Parallax Effects ---
function initializeParallax() {
  const heroCanvas = document.getElementById("heroCanvas");
  const profileImg = document.getElementById("profile-img");
  const aboutSection = document.getElementById("about");

  window.addEventListener(
    "scroll",
    () => {
      const scrollY = window.scrollY;

      // Hero Canvas Parallax
      if (heroCanvas) {
        const parallaxSpeedCanvas = 0.4;
        heroCanvas.style.transform = `translateY(${
          scrollY * parallaxSpeedCanvas
        }px)`;
      }

      // Profile Image Parallax
      if (profileImg && aboutSection) {
        const isDesktop = window.innerWidth >= 1024; // Aktifkan hanya di layar besar (lg)

        if (isDesktop) {
          const sectionTop = aboutSection.offsetTop;
          const sectionHeight = aboutSection.offsetHeight;
          const scrollRelativeToSection = scrollY - sectionTop;
          const parallaxSpeedImg = 0.2;

          if (
            scrollY + window.innerHeight > sectionTop &&
            scrollY < sectionTop + sectionHeight
          ) {
            const translateY = scrollRelativeToSection * -parallaxSpeedImg; // Dibalik arahnya
            profileImg.style.transform = `translateY(${translateY}px)`;
          } else {
            profileImg.style.transform = "translateY(0px)";
          }
        } else {
          // Di mobile & tablet, pastikan gambar tidak bergerak
          profileImg.style.transform = "translateY(0px)";
        }
      }
    },
    { passive: true }
  );
}

// --- Nav Link Highlighting on Scroll ---
function initializeNavHighlighting() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(
    ".desktop-nav a.nav-link-anchor, .mobile-menu-overlay a"
  );
  const headerHeight = document.querySelector("nav").offsetHeight;

  window.highlightNavLinkOnScroll = function () {
    let currentSectionId = "";
    const scrollY = window.scrollY;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - headerHeight - 10;
      const sectionBottom = sectionTop + section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionBottom) {
        currentSectionId = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      const linkHref = link.getAttribute("href");
      const isDirectMatch = linkHref === `#${currentSectionId}`;

      // Cek apakah link ini adalah parent dari dropdown
      const parentGroup = link.closest(".nav-dropdown-group");
      let isSubmenuActive = false;
      if (parentGroup) {
        const dropdownItems =
          parentGroup.querySelectorAll(".nav-dropdown-item");
        dropdownItems.forEach((item) => {
          if (item.getAttribute("href") === `#${currentSectionId}`) {
            isSubmenuActive = true;
            item.classList.add("active");
          } else {
            item.classList.remove("active");
          }
        });
      }

      if (isDirectMatch || isSubmenuActive) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  };

  window.addEventListener("scroll", highlightNavLinkOnScroll, {
    passive: true,
  });
}

// --- Smooth Scrolling for Nav Links ---
function initializeSmoothScroll() {
  const navLinks = document.querySelectorAll('a[href^="#"]');
  const header = document.querySelector("nav");

  if (!header) return;

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href.length > 1 && href.startsWith("#")) {
        e.preventDefault();

        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          const headerHeight = header.offsetHeight;
          const targetPosition =
            targetElement.getBoundingClientRect().top +
            window.scrollY -
            headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });

          if (
            document.getElementById("mobileMenu").classList.contains("open")
          ) {
            closeMobileMenu();
          }
        }
      }
    });
  });
}

// --- Hero Title Shatter Effect ---
function initializeShatterEffect() {
  const shatterTexts = document.querySelectorAll(".shatter-text");
  if (!shatterTexts.length) return;

  shatterTexts.forEach((textElement) => {
    const text = textElement.textContent;
    const hasGradient = textElement.classList.contains("text-gradient-shiny");
    textElement.innerHTML = ""; // Kosongkan elemen

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const span = document.createElement("span");
      span.className = "shatter-char";
      // Jika elemen induk memiliki gradien, terapkan juga ke setiap huruf
      if (hasGradient) {
        span.classList.add("text-gradient-shiny");
      }
      // Jika karakter adalah spasi, gunakan &nbsp; agar tetap terlihat
      span.innerHTML = char === " " ? "&nbsp;" : char;
      textElement.appendChild(span);

      span.addEventListener("mouseover", () => {
        const dx = (Math.random() - 0.5) * 50;
        const dy = (Math.random() - 0.5) * 50;
        const rot = (Math.random() - 0.5) * 30;

        span.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
        span.style.opacity = "0";

        // Kembali ke posisi semula setelah jeda
        setTimeout(() => {
          span.style.transform = "translate(0, 0) rotate(0deg)";
          span.style.opacity = "1";
        }, 500);
      });
    }
  });
}

// --- Scroll Down Arrow Fade Out ---
function initializeScrollDownArrowBehavior() {
  const scrollDownArrow = document.querySelector(".scroll-down-container");
  if (!scrollDownArrow) return;

  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > 50) {
        scrollDownArrow.classList.remove("visible");
        scrollDownArrow.style.transform = "translateX(-50%) translateY(20px)";
        scrollDownArrow.style.pointerEvents = "none";
      } else {
        scrollDownArrow.classList.add("visible");
        scrollDownArrow.style.transform = "translateX(-50%) translateY(0)";
        scrollDownArrow.style.pointerEvents = "auto";
      }
    },
    { passive: true }
  );
}
