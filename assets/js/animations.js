// js/animations.js

// --- Hero Canvas "Plexus" Animation ---
function initializeHeroCanvas() {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let particles = [];
  const numberOfParticles = 80;
  const maxDistance = 150;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = document.querySelector("header").offsetHeight;
  }

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 3 + 1;
      this.speedX = Math.random() * 0.5 - 0.25;
      this.speedY = Math.random() * 0.5 - 0.25;
      this.color = `rgba(99, 179, 237, ${Math.random() * 0.5 + 0.3})`;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
      if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
    }
    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function init() {
    particles = [];
    for (let i = 0; i < numberOfParticles; i++) {
      particles.push(
        new Particle(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        )
      );
    }
  }

  function connect() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a; b < particles.length; b++) {
        const distance = Math.sqrt(
          (particles[a].x - particles[b].x) ** 2 +
            (particles[a].y - particles[b].y) ** 2
        );
        if (distance < maxDistance) {
          const opacityValue = 1 - distance / maxDistance;
          ctx.strokeStyle = `rgba(99, 179, 237, ${opacityValue})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animateCanvas() {
    requestAnimationFrame(animateCanvas);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    connect();
  }

  window.addEventListener("load", () => {
    resizeCanvas();
    init();
    animateCanvas();
  });
  window.addEventListener("resize", () => {
    resizeCanvas();
    init();
  });
}

// --- Scroll-triggered Animations ---
function initializeScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    ".workflow-step, .fade-in-on-scroll, #skills-grid, #services-grid"
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
        // Handle staggered animations for grids
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
