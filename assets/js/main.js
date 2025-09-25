document.addEventListener("DOMContentLoaded", () => {
  // Initialize UI elements
  enableIOSChromeNavbarFix();
  initializeTheme();
  initializeMobileMenu();
  initializeNavbarScrollEffect();
  initializeFullHeightHero();
  initializeBSOD();
  initializeModals();
  initializeScrollToTop();
  initializeSkillFiltering();
  initializeNavHighlighting();

  // Initialize Animations
  initializeHeroCanvas();
  initializeScrollAnimations();
  initializeParallax();
  initializeTypingEffect(); // Pastikan ini dipanggil
  initializeSmoothScroll();

  // Initialize Interactive Components
  initializeVisitorCounter();
  initializePathfindingVisualizer();
  initializePaletteGenerator();
  initializeCertificateGenerator();
  initializeCodeViewers();
  initializeTimeTravelerAchievement();
  initializeCssHackerAchievement();
  initializeCaseStudyGenerator();
  initializeContactForm();

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
    // populateStaticData(); // Dinonaktifkan untuk mencegah penimpaan hero-subtitle
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

// Panggil populateStaticData setelah DOMContentLoaded, tapi pastikan tidak menimpa hero-subtitle
document.addEventListener("DOMContentLoaded", () => {
  if (typeof populateStaticData === "function") {
    populateStaticData();
  }
});
