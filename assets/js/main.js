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
  initializeDirectionalNavHover();
  initializeTypingEffect();
  initializeShatterEffect();
  initializeSmoothScroll();
  initializeScrollDownArrowBehavior();

  // Initialize Interactive Components
  initializeVisitorCounter();
  initializePathfindingVisualizer();
  initializeCsvToChartGenerator();
  initializeAiTextAnalyzer();
  initializeTextConverter();
  initializePaletteGenerator();
  initializeCertificateGenerator();
  initializeCodeViewers();
  initializeTimeTravelerAchievement();
  initializeCssHackerAchievement();
  initializeCaseStudyGenerator();
  initializeContactForm();
  initializeGenerativeArt();
  initializePdfSigner();

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

  // Show floating/initial buttons after a short delay to ensure everything is rendered
  setTimeout(() => {
    const scrollDownArrow = document.querySelector(".scroll-down-container");
    const terminalBtn = document.getElementById("terminal-toggle-btn");
    const achievementBtn = document.getElementById("achievement-toggle-btn");
    const heroBtns = document.getElementById("hero-buttons");
    if (scrollDownArrow) scrollDownArrow.classList.add("visible");
    if (terminalBtn) terminalBtn.classList.add("visible");
    if (achievementBtn) achievementBtn.classList.add("visible");
    if (heroBtns) heroBtns.classList.add("visible");
  }, 500);

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
