// --- Navbar Scroll Effect ---
function initializeNavbarScrollEffect() {
  const navbar = document.querySelector("nav");
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add("nav-scrolled");
    } else {
      navbar.classList.remove("nav-scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
}

// --- Full Height Hero Section Adjustment ---
function initializeFullHeightHero() {
  const hero = document.querySelector(".hero-full-height");
  const navbar = document.querySelector("nav");
  if (!hero || !navbar) return;

  let resizeTimeout;

  const setHeroHeight = () => {
    const navbarHeight = navbar.offsetHeight;
    const actualHeight = window.innerHeight - navbarHeight;
    hero.style.setProperty("--svh", `${actualHeight}px`);
  };

  // Panggil saat pertama kali dimuat
  setHeroHeight();

  // Panggil saat ukuran jendela berubah (dengan debounce)
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(setHeroHeight, 100);
    },
    { passive: true }
  );

  // Panggil saat orientasi layar berubah (penting untuk mobile)
  if (window.screen.orientation) {
    window.screen.orientation.addEventListener("change", setHeroHeight);
  }
}

// --- Theme Management ---
function initializeTheme() {
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const themeDropdown = document.getElementById("theme-dropdown");
  const themeOptions = document.querySelectorAll(".theme-option");
  const mobileThemeContainer = document.getElementById("mobile-theme-switcher");
  const THEME_ACHIEVEMENT_ID = "theme_connoisseur";
  let appliedThemes = new Set(
    JSON.parse(localStorage.getItem("appliedThemes") || "[]")
  );

  const applyTheme = (theme) => {
    if (!theme) return;

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      document.documentElement.setAttribute("data-theme", systemTheme);
      updateIcons(systemTheme, true);
    } else {
      document.documentElement.setAttribute("data-theme", theme);
      updateIcons(theme, false);
    }
    localStorage.setItem("theme", theme);

    // --- New Achievement Logic ---
    if (
      window.achievements &&
      !window.achievements[THEME_ACHIEVEMENT_ID]?.unlocked
    ) {
      if (!appliedThemes.has(theme)) {
        appliedThemes.add(theme);
        localStorage.setItem(
          "appliedThemes",
          JSON.stringify([...appliedThemes])
        );
      }
      if (
        appliedThemes.has("light") &&
        appliedThemes.has("dark") &&
        appliedThemes.has("system")
      ) {
        unlockAchievement(THEME_ACHIEVEMENT_ID);
      }
    }

    updateActiveState(theme);
  };

  const updateIcons = (theme, isSystem) => {
    document
      .getElementById("theme-icon-light")
      .classList.toggle("hidden", theme !== "light" || isSystem);
    document
      .getElementById("theme-icon-dark")
      .classList.toggle("hidden", theme !== "dark" || isSystem);
    document
      .getElementById("theme-icon-system")
      .classList.toggle("hidden", !isSystem);
  };

  const updateActiveState = (theme) => {
    themeOptions.forEach((opt) => {
      opt.classList.toggle("active", opt.dataset.themeValue === theme);
    });
    if (mobileThemeContainer) {
      const mobileButtons = mobileThemeContainer.querySelectorAll("button");
      mobileButtons.forEach((btn) => {
        const isActive = btn.dataset.themeValue === theme;

        btn.classList.toggle("bg-accent", isActive);
        btn.classList.toggle("text-menu-active", isActive);
        btn.classList.toggle("text-secondary", !isActive);
        btn.classList.toggle("bg-card-secondary", !isActive);
      });
    }
  };

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      themeDropdown.classList.toggle("open");
    });
  }

  document.addEventListener("click", (e) => {
    if (
      themeToggleBtn &&
      !themeToggleBtn.contains(e.target) &&
      themeDropdown &&
      !themeDropdown.contains(e.target)
    ) {
      themeDropdown.classList.remove("open");
    }
  });

  themeOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const theme = option.dataset.themeValue;
      applyTheme(theme);
      if (themeDropdown) themeDropdown.classList.remove("open");
    });
  });

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (localStorage.getItem("theme") === "system") {
        applyTheme("system");
      }
    });

  if (mobileThemeContainer) {
    const mobileThemes = [
      { value: "light", icon: "sun" },
      { value: "dark", icon: "moon" },
      { value: "system", icon: "laptop" },
    ];
    mobileThemes.forEach((theme) => {
      const btn = document.createElement("button");
      btn.dataset.themeValue = theme.value;
      btn.className = "p-2 rounded-full transition-colors";
      btn.setAttribute("aria-label", `Switch to ${theme.value} theme`);
      btn.innerHTML = `<i data-lucide="${theme.icon}" class="w-5 h-5"></i>`;
      btn.addEventListener("click", () => {
        applyTheme(theme.value);
      });
      mobileThemeContainer.appendChild(btn);
    });
  }

  const savedTheme = localStorage.getItem("theme") || "system";
  applyTheme(savedTheme);
  document.documentElement.classList.add("theme-ready");
}

// --- Mobile Menu ---
function initializeMobileMenu() {
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileMenuToggleBtn = document.getElementById("mobileMenuToggleBtn");

  const setAnimationDelays = (isOpen) => {
    const menuItems = mobileMenu.querySelectorAll("a, .mt-8");
    menuItems.forEach((item, index) => {
      item.style.transitionDelay = isOpen ? `${100 + index * 40}ms` : "0ms";
    });
  };

  window.toggleMobileMenu = function () {
    const isOpen = mobileMenu.classList.toggle("open");
    if (mobileMenuToggleBtn) {
      mobileMenuToggleBtn.setAttribute("aria-expanded", isOpen.toString());
    }
    document.body.classList.toggle("modal-open", isOpen);
    setAnimationDelays(isOpen);
  };

  window.closeMobileMenu = function () {
    mobileMenu.classList.remove("open");
    if (mobileMenuToggleBtn) {
      mobileMenuToggleBtn.setAttribute("aria-expanded", "false");
    }
    document.body.classList.remove("modal-open");
    setAnimationDelays(false);
    setTimeout(() => {
      highlightNavLinkOnScroll();
    }, 100);
  };
}

// --- Helper Functions ---
function parseMarkdownBold(text) {
  if (!text) return "";
  return text.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="font-semibold text-accent">$1</strong>'
  );
}

// --- Modals (Project, Achievement, Confirm) ---
function initializeModals() {
  const projectModal = document.getElementById("projectModal");
  const achievementModal = document.getElementById("achievementModal");
  const lightboxModal = document.getElementById("lightboxModal");

  // Project Modal
  window.openModal = function (projectId) {
    const project = projectsData.find((p) => p.id === projectId);
    if (project && projectModal) {
      document.getElementById("modalTitle").textContent =
        project.title || "Detail Proyek";
      document.getElementById("modalType").textContent = `Jenis: ${
        project.type || ""
      }`;
      document.getElementById("modalRole").textContent = `Peran: ${
        project.role || ""
      }`;
      document.getElementById("modalGoal").innerHTML = parseMarkdownBold(
        project.goal || ""
      );
      document.getElementById("modalProcess").innerHTML = parseMarkdownBold(
        project.process || ""
      );
      document.getElementById("modalImpact").innerHTML = parseMarkdownBold(
        project.impact || ""
      );

      // Tambahkan Tech Stack
      const modalTechStack = document.getElementById("modalTechStack");
      if (modalTechStack) {
        modalTechStack.innerHTML = "";
        if (project.techStack && project.techStack.length > 0) {
          project.techStack.forEach((tech) => {
            const tagEl = document.createElement("div");
            tagEl.className = "tech-tag";
            tagEl.textContent = tech.name;

            // --- New Tooltip Logic ---
            const tooltip = document.getElementById("global-tooltip");
            tagEl.addEventListener("mouseenter", () => {
              tooltip.textContent = tech.reason;
              tooltip.classList.add("visible");

              const tagRect = tagEl.getBoundingClientRect();
              const tooltipRect = tooltip.getBoundingClientRect();

              let top = tagRect.top - tooltipRect.height - 8;
              let left =
                tagRect.left + tagRect.width / 2 - tooltipRect.width / 2;

              if (left < 10) left = 10;
              if (left + tooltipRect.width > window.innerWidth - 10)
                left = window.innerWidth - tooltipRect.width - 10;

              tooltip.style.top = `${top}px`;
              tooltip.style.left = `${left}px`;
            });

            tagEl.addEventListener("mouseleave", () => {
              tooltip.classList.remove("visible");
            });

            modalTechStack.appendChild(tagEl);
          });
        }
      }

      const modalImages = document.getElementById("modalImages");
      modalImages.innerHTML = "";
      if (project.images && project.images.length > 0) {
        project.images.forEach((imgData) => {
          const imgElement = document.createElement("img");
          imgElement.src = imgData.src;
          imgElement.alt = imgData.alt;
          imgElement.className =
            "rounded-lg w-full h-auto object-cover shadow-md transition-transform duration-200 hover:scale-105";
          imgElement.onerror = function () {
            this.onerror = null;
            this.src =
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGE1NTY4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjIwIiBmaWxsPSIjZTJlOGYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5JbWFnZSBFcnJvciA8L3RleHQ+PC9zdmc+";
          };
          imgElement.addEventListener("click", () => openLightbox(imgData.src));
          modalImages.appendChild(imgElement);
        });
      }

      const modalLinks = document.getElementById("modalLinks");
      modalLinks.innerHTML = "";
      if (project.links) {
        if (project.links.playStore) {
          const linkEl = document.createElement("a");
          linkEl.href = project.links.playStore;
          linkEl.target = "_blank";
          linkEl.rel = "noopener noreferrer";
          linkEl.className = "btn-secondary inline-flex items-center gap-2";
          linkEl.innerHTML = `<i data-lucide="play-circle"></i>Lihat di Play Store`;
          modalLinks.appendChild(linkEl);
        }
        if (project.links.liveSite) {
          const linkEl = document.createElement("a");
          linkEl.href = project.links.liveSite;
          linkEl.target = "_blank";
          linkEl.rel = "noopener noreferrer";
          linkEl.className = "btn-secondary inline-flex items-center gap-2";
          linkEl.innerHTML = `<i data-lucide="external-link"></i>Kunjungi Situs`;
          modalLinks.appendChild(linkEl);
        }

        if (typeof lucide !== "undefined") {
          lucide.createIcons();
        }
      }
      projectModal.classList.add("open");
      document.body.classList.add("modal-open");
    }
  };

  window.closeModal = function () {
    if (projectModal) projectModal.classList.remove("open");
    document.body.classList.remove("modal-open");
  };

  if (projectModal) {
    projectModal.addEventListener("click", (e) => {
      if (e.target === projectModal) closeModal();
    });
  }

  // Lightbox Modal
  window.openLightbox = function (imageUrl) {
    const lightboxImage = document.getElementById("lightboxImage");
    if (lightboxModal && lightboxImage) {
      lightboxImage.src = imageUrl;
      lightboxModal.classList.add("open");
      document.body.classList.add("modal-open");
    }
  };

  window.closeLightbox = function () {
    if (lightboxModal) {
      lightboxModal.classList.remove("open");
      document.body.classList.remove("modal-open");
    }
  };

  if (lightboxModal) {
    lightboxModal.addEventListener("click", (e) => {
      if (e.target.id === "lightboxModal") closeLightbox();
    });
  }

  // Achievement Modal
  window.openAchievementModal = function () {
    populateAchievements();
    if (achievementModal) achievementModal.classList.add("open");
    document.body.classList.add("modal-open");
  };

  window.closeAchievementModal = function () {
    if (achievementModal) achievementModal.classList.remove("open");
    document.body.classList.remove("modal-open");
  };

  const achievementToggleBtn = document.getElementById(
    "achievement-toggle-btn"
  );
  if (achievementToggleBtn)
    achievementToggleBtn.addEventListener("click", openAchievementModal);
  if (achievementModal)
    achievementModal.addEventListener("click", (e) => {
      if (e.target === achievementModal) closeAchievementModal();
    });

  // Custom Confirm Modal
  window.showCustomConfirm = function (
    message,
    yesCallback,
    noCallback,
    yesText = "Ya",
    noText = "Tidak"
  ) {
    const modal = document.getElementById("customConfirmModal");
    const msgElement = document.getElementById("customConfirmMessage");
    const btnYes = document.getElementById("customConfirmButtonYes");
    const btnNo = document.getElementById("customConfirmButtonNo");

    msgElement.textContent = message;
    btnYes.textContent = yesText;
    btnNo.textContent = noText;

    const newBtnYes = btnYes.cloneNode(true);
    btnYes.parentNode.replaceChild(newBtnYes, btnYes);

    const newBtnNo = btnNo.cloneNode(true);
    btnNo.parentNode.replaceChild(newBtnNo, btnNo);

    newBtnYes.onclick = () => {
      modal.classList.add("hidden");
      if (yesCallback) yesCallback();
    };

    newBtnNo.onclick = () => {
      modal.classList.add("hidden");
      if (noCallback) noCallback();
    };

    modal.classList.remove("hidden");
  };
}

// --- BSOD Easter Egg ---
function initializeBSOD() {
  const container = document.getElementById("bsod-container");
  const successModal = document.getElementById("bsodSuccessModal");
  if (!container || !successModal) return;

  const bsodViews = {
    win: document.getElementById("bsod-win"),
    mac: document.getElementById("bsod-mac"),
    linux: document.getElementById("bsod-linux"),
    ios: document.getElementById("bsod-ios"),
    android: document.getElementById("bsod-android"),
  };

  const closeSuccessModal = () => {
    successModal.classList.add("hidden");
    lucide.createIcons();
  };

  document
    .getElementById("bsodSuccessCloseBtn")
    .addEventListener("click", closeSuccessModal);

  const showSuccess = () => {
    successModal.classList.remove("hidden");
    lucide.createIcons();
  };

  const hideAllBSOD = () => {
    container.classList.add("hidden");
    Object.values(bsodViews).forEach((view) => view.classList.add("hidden"));
  };

  window.triggerBSOD = function () {
    const isNewlyUnlocked = unlockAchievement("system_crasher");

    let targetBsod = bsodViews.linux;
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes("windows nt")) {
      targetBsod = bsodViews.win;
    } else if (userAgent.includes("macintosh")) {
      targetBsod = bsodViews.mac;
    } else if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
      targetBsod = bsodViews.ios;
    } else if (userAgent.includes("android")) {
      targetBsod = bsodViews.android;
    }

    container.classList.remove("hidden");
    targetBsod.classList.remove("hidden");

    const completeSequence = () => {
      hideAllBSOD();
      if (isNewlyUnlocked) {
        showSuccess();
      }
    };

    if (targetBsod === bsodViews.win) {
      const progressEl = document.getElementById("bsod-win-progress");
      let progress = 0;
      progressEl.textContent = progress;

      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if (progress >= 100) {
          progress = 100;
          progressEl.textContent = progress;
          clearInterval(interval);
          setTimeout(completeSequence, 500);
        } else {
          progressEl.textContent = progress;
        }
      }, 300);
    } else if (targetBsod === bsodViews.ios) {
      const progressInner = document.getElementById("ios-progress-bar-inner");
      let progress = 0;
      progressInner.style.width = "0%";

      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 5;
        if (progress >= 100) {
          progress = 100;
          progressInner.style.width = `${progress}%`;
          clearInterval(interval);
          setTimeout(completeSequence, 500);
        } else {
          progressInner.style.width = `${progress}%`;
        }
      }, 400);
    } else {
      setTimeout(completeSequence, 3000);
    }
  };
}

// --- Project Rendering ---
function renderProjects(projects, filter = "all") {
  const portfolioGrid = document.getElementById("portfolio-grid");
  if (!portfolioGrid) return;
  portfolioGrid.innerHTML = "";

  const filteredProjects =
    filter === "all" ? projects : projects.filter((p) => p.category === filter);

  if (filteredProjects.length === 0) {
    portfolioGrid.innerHTML = `<p class="col-span-full text-center" style="color: var(--text-secondary);">Tidak ada proyek dalam kategori ini.</p>`;
    return;
  }

  filteredProjects.forEach((project, index) => {
    const projectCard = document.createElement("div");
    projectCard.className = `
      project-card p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer
      project-card p-6 transform hover:scale-105 transition-all duration-300 cursor-pointer liquid-glass-card
    `;
    projectCard.style.animationDelay = `${index * 75}ms`;
    projectCard.style.backgroundColor = "var(--bg-card-secondary)";
    projectCard.setAttribute("onclick", `openModal('${project.id}')`);

    projectCard.innerHTML = `
      <img src="${project.thumbnail}" alt="Thumbnail untuk ${project.title}" class="rounded-lg mb-4 w-full h-48 object-cover" onerror="this.onerror=null;this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGE1NTY4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjIwIiBmaWxsPSIjZTJlOGYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5JbWFnZSBFcnJvciA8L3RleHQ+PC9zdmc+';">
      <h3 class="text-2xl font-bold mb-2" style="color: var(--text-white);">${project.title}</h3>
      <p class="text-lg mb-4" style="color: var(--text-secondary);">${project.type}</p>
      <span class="inline-block text-white text-xs font-semibold px-3 py-1 rounded-full" style="background-color: var(--color-accent);">${project.tag}</span>
    `;
    portfolioGrid.appendChild(projectCard);
  });
}

// --- Project Filter Rendering ---
function renderProjectFilters(projects) {
  const filtersContainer = document.getElementById("portfolio-filters");
  if (!filtersContainer) return;

  const categoryDetails = {
    all: { name: "Semua", icon: "layout-grid" },
    web: { name: "Web", icon: "globe" },
    mobile: { name: "Mobile", icon: "smartphone" },
  };

  const projectCategories = [...new Set(projects.map((p) => p.category))];
  const orderedCategories = [
    "all",
    ...projectCategories.filter((cat) => cat !== "all"),
  ];

  orderedCategories.forEach((categoryKey) => {
    const details = categoryDetails[categoryKey];
    if (!details) return;

    const button = document.createElement("button");
    button.className = "filter-btn";
    button.dataset.filter = categoryKey;
    button.innerHTML = `<i data-lucide="${details.icon}" class="w-4 h-4 mr-2"></i><span>${details.name}</span>`;

    if (categoryKey === "all") {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      if (button.classList.contains("active")) return;

      filtersContainer
        .querySelectorAll(".filter-btn")
        .forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const portfolioGrid = document.getElementById("portfolio-grid");
      const existingCards = portfolioGrid.querySelectorAll(".project-card");

      existingCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 50}ms`;
        card.classList.add("fading-out");
      });

      const totalFadeOutTime =
        300 + (existingCards.length > 0 ? (existingCards.length - 1) * 50 : 0);
      setTimeout(() => {
        renderProjects(projects, categoryKey);
      }, totalFadeOutTime);
    });

    filtersContainer.appendChild(button);
  });

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// --- Interactive Skill Filtering ---
function initializeSkillFiltering() {
  const skillCards = document.querySelectorAll(".skill-card[data-skill]");
  const portfolioSection = document.getElementById("portfolio");

  skillCards.forEach((card) => {
    card.addEventListener("click", () => {
      const skill = card.dataset.skill;

      const filterButton = document.querySelector(
        `#portfolio-filters .filter-btn[data-filter="${skill}"]`
      );

      if (filterButton) {
        portfolioSection.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => filterButton.click(), 500);
      }
    });
  });
}

// --- Testimonial Rendering ---
function renderTestimonials(testimonials) {
  const testimonialsGrid = document.getElementById("testimonials-grid");
  if (!testimonialsGrid) return;
  testimonialsGrid.innerHTML = "";

  testimonials.forEach((testimonial) => {
    const testimonialCard = document.createElement("div");
    testimonialCard.className =
      "testimonial-card p-6 text-left liquid-glass-card shadow-lg";
    testimonialCard.innerHTML = `
      <p class="italic mb-4" style="color: var(--text-secondary);">
        "${parseMarkdownBold(testimonial.quote)}"
      </p>
      <p class="font-semibold" style="color: var(--text-white);">
        - ${testimonial.name}
      </p>
      <p class="text-sm" style="color: var(--text-secondary);">${
        testimonial.title
      }</p>
    `;
    testimonialsGrid.appendChild(testimonialCard);
  });
}

// --- Achievement System UI ---
let paletteGenerationCount = parseInt(
  localStorage.getItem("paletteCount") || "0"
);

function showToast(achievementName) {
  const toast = document.getElementById("achievement-toast");
  const nameElement = document.getElementById("toast-achievement-name");
  if (!toast || !nameElement) return;

  nameElement.textContent = achievementName;
  toast.classList.remove("hidden");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 500);
  }, 4000);
}

window.unlockAchievement = function (id) {
  if (achievements[id] && !achievements[id].unlocked) {
    achievements[id].unlocked = true;
    showToast(achievements[id].name);

    const saved = JSON.parse(
      localStorage.getItem("portfolioAchievements") || "[]"
    );
    if (!saved.includes(id)) {
      saved.push(id);
      localStorage.setItem("portfolioAchievements", JSON.stringify(saved));
    }
    return true;
  }
  return false;
};

function loadAchievements() {
  const saved = localStorage.getItem("portfolioAchievements");
  if (saved) {
    const unlockedIds = JSON.parse(saved);
    unlockedIds.forEach((id) => {
      if (achievements[id]) {
        achievements[id].unlocked = true;
      }
    });
  }
}

function populateAchievements() {
  const achievementGrid = document.getElementById("achievement-grid");
  const progressBar = document.getElementById("achievement-progress-bar");
  const progressText = document.getElementById("achievement-progress-text");

  if (!achievementGrid) return;
  achievementGrid.innerHTML = "";

  const unlockedIds = JSON.parse(
    localStorage.getItem("portfolioAchievements") || "[]"
  );
  const totalAchievements = Object.keys(achievements).length;
  const unlockedCount = unlockedIds.length;

  if (progressBar && progressText) {
    const percentage =
      totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0;
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${unlockedCount}/${totalAchievements}`;
  }

  for (const id in achievements) {
    const ach = achievements[id];
    const isUnlocked = unlockedIds.includes(id);
    const item = document.createElement("div");
    item.className = "achievement-item";
    item.title = isUnlocked ? ach.description : "Pencapaian Terkunci";

    item.innerHTML = `
      <div class="achievement-badge ${isUnlocked ? "unlocked" : "locked"}">
        <i data-lucide="${
          isUnlocked ? ach.icon || "award" : "lock"
        }" class="w-8 h-8"></i>
      </div>
      <div class="achievement-info">
        <p class="achievement-name">${ach.name}</p>
        <p class="achievement-desc">${isUnlocked ? ach.description : "???"}</p>
      </div>
    `;
    achievementGrid.appendChild(item);
  }
  lucide.createIcons();
}

// --- Scroll to Top ---
function initializeScrollToTop() {
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  if (!scrollToTopBtn) return;

  window.addEventListener(
    "scroll",
    () => {
      if (
        document.body.scrollTop > 20 ||
        document.documentElement.scrollTop > 20
      ) {
        scrollToTopBtn.classList.add("visible");
      } else {
        scrollToTopBtn.classList.remove("visible");
      }
    },
    { passive: true }
  );

  window.scrollToTop = function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
}

// --- Populate UI with Centralized Data ---
function populateStaticData() {
  if (typeof siteConfig === "undefined") return;

  // Navbar
  const navBrand = document.getElementById("nav-brand");
  if (navBrand) {
    navBrand.textContent = siteConfig.name;
  }

  // About Section
  document.getElementById("cv-link-about").href = siteConfig.cvUrl;

  // Contact Section
  const contactEmail = document.getElementById("contact-email");
  contactEmail.href = `mailto:${siteConfig.email}`;
  contactEmail.textContent = siteConfig.email;

  const contactPhone = document.getElementById("contact-phone");
  contactPhone.href = `tel:${siteConfig.phone}`;
  contactPhone.textContent = siteConfig.phoneDisplay;

  const contactLinkedin = document.getElementById("contact-linkedin");
  contactLinkedin.href = siteConfig.social.linkedin;

  // Footer
  const currentYear = new Date().getFullYear();
  document.getElementById(
    "footer-text"
  ).textContent = `© ${currentYear} ${siteConfig.name}. Hak Cipta Dilindungi Undang-Undang.`;
}

// --- Contact Form with Real-time Validation ---
function initializeContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const messageInput = document.getElementById("message");
  const submitButton = document.getElementById("submit-contact-form");
  const COOLDOWN_MINUTES = 5;
  const lastSubmission = parseInt(
    localStorage.getItem("lastContactSubmission") || "0"
  );
  const timeSinceLastSubmission = Date.now() - lastSubmission;

  if (timeSinceLastSubmission < COOLDOWN_MINUTES * 60 * 1000) {
    const minutesRemaining = Math.ceil(
      (COOLDOWN_MINUTES * 60 * 1000 - timeSinceLastSubmission) / 60000
    );
    form.innerHTML = `<div class="text-center p-4 rounded-lg" style="background-color: var(--bg-card-secondary);">
        <h4 class="text-xl font-bold text-accent">Terlalu Cepat!</h4>
        <p style="color: var(--text-secondary);">Anda baru saja mengirim pesan. Silakan coba lagi dalam ${minutesRemaining} menit.</p>
      </div>`;
    return;
  }

  const validators = {
    name: (value) => value.trim() !== "",
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: (value) => value.trim().length >= 10,
  };

  const errorMessages = {
    name: "Nama tidak boleh kosong.",
    email: "Format email tidak valid.",
    message: "Pesan harus berisi minimal 10 karakter.",
  };

  const validationState = { name: false, email: false, message: false };

  function validateField(input) {
    const isValid = validators[input.id](input.value);
    const errorElement = input.parentElement.nextElementSibling;
    validationState[input.id] = isValid;

    input.classList.toggle("valid", isValid);
    input.classList.toggle("invalid", !isValid && input.value.length > 0);
    errorElement.textContent =
      !isValid && input.value.length > 0 ? errorMessages[input.id] : "";

    submitButton.disabled = !Object.values(validationState).every(Boolean);
  }

  [nameInput, emailInput, messageInput].forEach((input) => {
    input.addEventListener("input", () => validateField(input));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (Object.values(validationState).every(Boolean)) {
      const submitText = submitButton.querySelector(".submit-text");
      const submitSpinner = submitButton.querySelector(".submit-spinner");
      submitText.classList.add("hidden");
      submitSpinner.classList.remove("hidden");
      submitButton.disabled = true;
      lucide.createIcons();

      const formData = new FormData(form);
      const formAction = `https://formspree.io/f/${FORMSPREE_ID}`;

      fetch(formAction, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            localStorage.setItem(
              "lastContactSubmission",
              Date.now().toString()
            );
            form.innerHTML = `<div class="text-center p-4 rounded-lg" style="background-color: var(--bg-card-secondary);">
              <h4 class="text-xl font-bold text-accent">Terima Kasih!</h4>
              <p style="color: var(--text-secondary);">Pesan Anda telah berhasil dikirim. Saya akan segera merespons.</p>
            </div>`;
          } else {
            throw new Error("Network response was not ok.");
          }
        })
        .catch((error) => {
          submitButton.textContent = "Kirim Pesan";
          submitButton.disabled = false;
          alert(
            "Maaf, terjadi kesalahan saat mengirim pesan. Silakan coba lagi."
          );
        });
    }
  });
}

// --- Fix khusus Chrome iOS: pakai fixed + padding body ---
function enableIOSChromeNavbarFix() {
  const ua = navigator.userAgent || navigator.vendor || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isChromeIOS = /CriOS/.test(ua);
  if (!(isIOS && isChromeIOS)) return;

  const nav = document.querySelector("nav");
  if (!nav) return;

  document.documentElement.classList.add("ios-chrome");

  const applyHeight = () => {
    const h = nav.offsetHeight || 64;
    document.documentElement.style.setProperty("--nav-height", h + "px");
    document.body.classList.add("has-fixed-nav");
  };

  applyHeight();
  // Rehitung saat UI atas berubah tinggi
  window.addEventListener("resize", applyHeight, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", applyHeight, {
      passive: true,
    });
  }
}
