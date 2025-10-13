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

  const mouse = {
    x: null,
    y: null,
    radius: 100,
  };

  // Palet warna yang harmonis untuk partikel
  const PLEXUS_PALETTE = [
    "#ffbe0b",
    "#fb5607",
    "#ff006e",
    "#8338ec",
    "#3a86ff",
  ];

  function updateThemeColors() {
    const accentColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-accent")
      .trim();
    const textColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--text-primary")
      .trim();

    const accentRgb = hexToRgb(accentColor);
    if (accentRgb) themeColors = accentRgb;

    const textRgb = hexToRgb(textColor);
    if (textRgb) themeTextColor = textRgb;
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1;
      this.speedX = Math.random() * 0.2 - 0.1;
      this.speedY = Math.random() * 0.2 - 0.1;

      const baseColor =
        PLEXUS_PALETTE[Math.floor(Math.random() * PLEXUS_PALETTE.length)];
      const rgbColor = hexToRgb(baseColor);
      this.color = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${
        Math.random() * 0.5 + 0.5
      })`;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
      if (this.y > canvas.height || this.y < 0) this.speedY *= -1;

      // Efek menjauh dari mouse (repulsion)
      if (mouse.x !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          // Kekuatan dorongan berbanding terbalik dengan jarak
          const force = (mouse.radius - distance) / mouse.radius;
          const moveX = forceDirectionX * force * 1.5;
          const moveY = forceDirectionY * force * 1.5;
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
            themeTextColor.b
          }, ${opacityValue * 0.5})`;
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
          const opacityValue = 1 - distance / config.maxDistance;
          ctx.strokeStyle = `rgba(${themeColors.r}, ${themeColors.g}, ${themeColors.b}, ${opacityValue})`;
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
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    connect();
  }

  // Inisialisasi instance
  resizeCanvas();
  init();
  animate();

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
  };
}

// --- Inisialisasi Semua Animasi Plexus ---
function initializeHeroCanvas() {
  const canvas = document.querySelector(".plexus-canvas");
  if (!canvas) return;

  const plexusInstances = [];

  const isMobile = window.innerWidth < 768;
  const options = {
    particleCount: isMobile ? 100 : 250, // Jumlah partikel untuk seluruh layar
    maxDistance: isMobile ? 100 : 120,
  };

  const instance = createPlexusInstance(canvas, options);
  if (instance) {
    plexusInstances.push(instance);
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
        const sectionTop = aboutSection.offsetTop;
        const sectionHeight = aboutSection.offsetHeight;
        const scrollRelativeToSection = scrollY - sectionTop;
        const parallaxSpeedImg = 0.2; // Meningkatkan kecepatan paralaks agar lebih terlihat

        if (
          scrollY + window.innerHeight > sectionTop &&
          scrollY < sectionTop + sectionHeight
        ) {
          const translateY = scrollRelativeToSection * parallaxSpeedImg;
          profileImg.style.transform = `translateY(${translateY}px)`;
        } else {
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

  shatterTexts.forEach(textElement => {
    const text = textElement.textContent;
    const hasGradient = textElement.classList.contains('text-gradient-shiny');
    textElement.innerHTML = ""; // Kosongkan elemen

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const span = document.createElement("span");
      span.className = "shatter-char";
      // Jika elemen induk memiliki gradien, terapkan juga ke setiap huruf
      if (hasGradient) {
        span.classList.add('text-gradient-shiny');
      }
      // Jika karakter adalah spasi, gunakan &nbsp; agar tetap terlihat
      span.innerHTML = char === " " ? "&nbsp;" : char;
      textElement.appendChild(span);

      span.addEventListener("mouseover", () => {
        const dx = (Math.random() - 0.5) * 50;
        const dy = (Math.random() - 0.5) * 50;
        const rot = (Math.random() - 0.5) * 30;

        span.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
        span.style.opacity = '0';

        // Kembali ke posisi semula setelah jeda
        setTimeout(() => {
          span.style.transform = "translate(0, 0) rotate(0deg)";
          span.style.opacity = '1';
        }, 500);
      });
    }
  });
}
