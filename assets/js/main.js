// js/main.js

document.addEventListener("DOMContentLoaded", () => {
  // Initialize UI elements
  initializeTheme();
  initializeMobileMenu();
  initializeBSOD();
  initializeModals();
  initializeScrollToTop();
  initializeNavHighlighting();

  // Initialize Animations
  initializeHeroCanvas();
  initializeScrollAnimations();
  initializeParallax();
  initializeSmoothScroll();

  // Initialize Interactive Components
  initializeVisitorCounter();
  initializePaletteGenerator();
  initializeCodeViewers();
  initializeTimeTravelerAchievement();

  // Initialize Complex Modules
  initializeTerminal();
  initializeChatbot();

  // Load data-dependent content
  if (typeof projectsData !== "undefined") {
    renderProjects(projectsData);
    renderProjectFilters(projectsData);
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
