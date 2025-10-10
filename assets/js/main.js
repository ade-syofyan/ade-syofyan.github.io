document.addEventListener("DOMContentLoaded", () => {
  // Initialize UI elements
  enableIOSChromeNavbarFix();
  initializeTheme();
  initializeMobileMenu();
  initializeNavbarScrollEffect();
  initializeFullHeightHero();
  populateStaticData();
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
  if (typeof workHistoryData !== "undefined") {
    renderWorkHistory(workHistoryData);
  }
  if (typeof certificatesData !== "undefined") {
    renderCertificates(certificatesData, 1); // Render halaman pertama
  }
  if (typeof testimonialsData !== "undefined") {
    renderTestimonials(testimonialsData);
    populateSchemaData();
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
