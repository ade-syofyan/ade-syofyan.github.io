// js/main.js

document.addEventListener("DOMContentLoaded", () => {
  // Initialize UI elements
  initializeTheme();
  initializeMobileMenu();
  initializeModals();
  initializeScrollToTop();
  initializeNavHighlighting();

  // Initialize Animations
  initializeHeroCanvas();
  initializeScrollAnimations();
  initializeParallax();

  // Initialize Interactive Components
  initializeVisitorCounter();
  initializePaletteGenerator();
  initializeCodeViewers();

  // Initialize Complex Modules
  initializeTerminal();
  initializeChatbot();

  // Load data-dependent content
  if (typeof projectsData !== "undefined") {
    renderProjects(projectsData);
  }
  if (typeof testimonialsData !== "undefined") {
    renderTestimonials(testimonialsData);
    populateStaticData(); // Panggil fungsi untuk mengisi data statis
  }
  if (typeof achievements !== "undefined") {
    loadAchievements();
  }

  // Final UI setup
  lucide.createIcons();

  // Explorer achievement
  const footer = document.querySelector("footer");
  window.addEventListener(
    "scroll",
    () => {
      if (window.innerHeight + window.scrollY >= footer.offsetTop)
        unlockAchievement("explorer");
    },
    { passive: true, once: true }
  );
});
