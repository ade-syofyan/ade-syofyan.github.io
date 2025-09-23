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
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
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
  const parentElement = canvas.parentElement;
  parentElement.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;

    // Trigger achievement on first interaction with hero canvas
    if (canvas.id === "heroCanvas" && !interactionTriggered) {
      if (window.unlockAchievement) {
        unlockAchievement("animation_conductor");
      }
      interactionTriggered = true;
    }
  });

  parentElement.addEventListener("mouseout", () => {
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
  const allCanvases = document.querySelectorAll("#heroCanvas, .plexus-canvas");
  if (allCanvases.length === 0) return;

  const plexusInstances = [];

  allCanvases.forEach((canvas) => {
    const options =
      canvas.id === "heroCanvas"
        ? { particleCount: 150, maxDistance: 160 }
        : { particleCount: 75, maxDistance: 110 };
    const instance = createPlexusInstance(canvas, options);
    if (instance) plexusInstances.push(instance);
  });

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
    ".fade-in-on-scroll, #skills-grid, #services-grid, #workflowSteps"
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
        const parallaxSpeedImg = 0.1;

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
    ".desktop-nav a, .mobile-menu-overlay a"
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
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSectionId}`) {
        link.classList.add("active");
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
