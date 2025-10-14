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
    const wrapper = document.querySelector(".theme-icon-wrapper");
    if (!wrapper) return;

    if (isSystem) {
      // Geser ke ikon 'system' (indeks 2)
      wrapper.style.transform = `translateY(-28px)`;
    } else if (theme === "dark") {
      // Geser ke ikon 'moon' (indeks 1)
      wrapper.style.transform = `translateY(0px)`;
    } else {
      // Geser ke ikon 'sun' (indeks 0)
      wrapper.style.transform = "translateY(28px)";
    }
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

  // --- Accordion Logic ---
  const submenuToggles = mobileMenu.querySelectorAll(".has-submenu");
  submenuToggles.forEach((clickedToggle) => {
    clickedToggle.addEventListener("click", () => {
      const wasOpen = clickedToggle.classList.contains("open");

      // Tutup semua akordeon terlebih dahulu
      submenuToggles.forEach((toggle) => {
        toggle.classList.remove("open");
        toggle.nextElementSibling.classList.remove("open");
      });

      // Jika item yang diklik sebelumnya tidak terbuka, buka sekarang.
      // Ini akan membuat item yang sudah terbuka menjadi tertutup saat diklik lagi.
      if (!wasOpen) {
        clickedToggle.classList.add("open");
        clickedToggle.nextElementSibling.classList.add("open");
      }
    });
  });

  // --- Link Click Logic ---
  const menuLinks = mobileMenu.querySelectorAll("a.mobile-menu-item");
  menuLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      // Allow default behavior (scrolling) but close the menu
      closeMobileMenu();
    });
  });

  const setAnimationDelays = (isOpen) => {
    const menuItems = mobileMenu.querySelectorAll(
      ".mobile-menu-group, .mobile-menu-item, .mobile-menu-cta, .text-center"
    );
    menuItems.forEach((item, index) => {
      item.style.transitionDelay = isOpen ? `${100 + index * 30}ms` : "0ms";
    });
  };

  window.toggleMobileMenu = function () {
    const isOpen = mobileMenu.classList.toggle("open");
    if (mobileMenuToggleBtn) {
      mobileMenuToggleBtn.setAttribute("aria-expanded", isOpen.toString());
    }
    isOpen ? lockBodyScroll() : unlockBodyScroll();
    setAnimationDelays(isOpen);
  };

  window.closeMobileMenu = function () {
    mobileMenu.classList.remove("open");
    if (mobileMenuToggleBtn) {
      mobileMenuToggleBtn.setAttribute("aria-expanded", "false");
    }
    unlockBodyScroll();
    setAnimationDelays(false);
  };
}

// --- Centralized Modal Scroll Lock Manager ---
let openModalCount = 0;
let scrollPosition = 0;

function lockBodyScroll() {
  openModalCount++;
  if (openModalCount === 1) {
    scrollPosition = window.pageYOffset;
    document.body.classList.add("modal-open");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = "100%";
  }
}

function unlockBodyScroll() {
  openModalCount--;
  if (openModalCount <= 0) {
    openModalCount = 0; // Mencegah angka negatif
    document.body.classList.remove("modal-open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, scrollPosition);
  }
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

  // Project Modal
  window.openModal = function (projectId) {
    const project = projectsData.find((p) => p.id === projectId);
    if (project && projectModal) {
      document.getElementById("modalTitle").textContent =
        project.title || "Detail Proyek";

      // Suntikkan Tipe dan Peran ke kontainer baru
      const metaInfoContainer = document.getElementById("modalMetaInfo");
      metaInfoContainer.innerHTML = `
        <span class="modal-meta-item">
          <i data-lucide="package" class="w-4 h-4"></i>
          <span>${project.type || "Proyek"}</span>
        </span>
        <span class="modal-meta-item">
          <i data-lucide="user-check" class="w-4 h-4"></i>
          <span>${project.role || "Developer"}</span>
        </span>
      `;

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
            tagEl.className = "tech-tag inline-flex items-center gap-2";
            tagEl.innerHTML = `<i data-lucide="cpu" class="w-3.5 h-3.5 opacity-70"></i><span>${tech.name}</span>`;

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

      // --- Logika Baru untuk Carousel Slider ---
      const imageSlider = document.getElementById("modalImageSlider");
      const imageWrapper = document.getElementById("modalImageWrapper");
      const paginationContainer = document.getElementById("slider-pagination");
      const prevBtn = document.getElementById("slider-prev-btn");
      const nextBtn = document.getElementById("slider-next-btn");

      imageWrapper.innerHTML = "";
      paginationContainer.innerHTML = "";
      let currentSlide = 0;

      if (project.images && project.images.length > 0) {
        imageSlider.classList.remove("hidden"); // Pastikan slider terlihat

        project.images.forEach((imgData) => {
          // Buat slide
          const slide = document.createElement("div");
          slide.className = "w-full flex-shrink-0";
          slide.innerHTML = `
            <img src="${imgData.src}" alt="${imgData.alt}"
                 class="w-full h-64 md:h-96 object-cover cursor-zoom-in project-modal-image"
                 data-lightbox-src="${imgData.src}"
                 onerror="this.onerror=null;this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGE1NTY4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjIwIiBmaWxsPSIjZTJlOGYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5JbWFnZSBFcnJvciA8L3RleHQ+PC9zdmc+';">
          `;
          // Langsung tambahkan event listener untuk memperbesar gambar saat diklik
          slide
            .querySelector(".project-modal-image")
            .addEventListener("click", (e) => {
              openLightbox(e.target.dataset.lightboxSrc);
            });
          imageWrapper.appendChild(slide);

          // Buat dot paginasi
          const dot = document.createElement("div");
          dot.className = "slider-pagination-dot"; // Index akan ditambahkan di dalam loop
          dot.addEventListener("click", () => goToSlide(index));
          paginationContainer.appendChild(dot);
        });

        const totalSlides = project.images.length;

        const updateSlider = () => {
          imageWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;

          // Update dots
          const dots = paginationContainer.children;
          for (let i = 0; i < dots.length; i++) {
            dots[i].classList.toggle("active", i === currentSlide);
          }

          // Update buttons
          prevBtn.disabled = currentSlide === 0;
          nextBtn.disabled = currentSlide === totalSlides - 1;
        };

        const goToSlide = (slideIndex) => {
          currentSlide = slideIndex;
          updateSlider();
        };

        prevBtn.onclick = () => {
          if (currentSlide > 0) {
            currentSlide--;
            updateSlider();
          }
        };

        nextBtn.onclick = () => {
          if (currentSlide < totalSlides - 1) {
            currentSlide++;
            updateSlider();
          }
        };

        updateSlider(); // Inisialisasi slider
      } else {
        imageSlider.classList.add("hidden");
      }

      const modalLinks = document.getElementById("modalLinks");
      modalLinks.innerHTML = "";
      if (project.links) {
        if (project.links.playStore) {
          const linkEl = document.createElement("a");
          linkEl.href = project.links.playStore;
          linkEl.target = "_blank";
          linkEl.rel = "noopener noreferrer";
          linkEl.className =
            "btn-primary w-full inline-flex items-center justify-center gap-2";
          linkEl.innerHTML = `<i data-lucide="play-circle"></i>Lihat di Play Store`;
          modalLinks.appendChild(linkEl);
        }
        if (project.links.liveSite) {
          const linkEl = document.createElement("a");
          linkEl.href = project.links.liveSite;
          linkEl.target = "_blank";
          linkEl.rel = "noopener noreferrer";
          linkEl.className =
            "btn-primary w-full inline-flex items-center justify-center gap-2";
          linkEl.innerHTML = `<i data-lucide="external-link"></i>Kunjungi Situs`;
          modalLinks.appendChild(linkEl);
        }
      }

      lucide.createIcons(); // Panggil di akhir setelah semua HTML disuntikkan
      projectModal.classList.add("open");
      lockBodyScroll();
    }
  };

  window.closeModal = function () {
    if (projectModal) projectModal.classList.remove("open");
    unlockBodyScroll();
  };

  if (projectModal) {
    projectModal.addEventListener("click", (e) => {
      if (e.target === projectModal) closeModal();
    });
  }

  const achievementModal = document.getElementById("achievementModal");
  const lightboxModal = document.getElementById("lightboxModal");
  const pdfViewerModal = document.getElementById("pdfViewerModal");

  // Lightbox Modal
  window.openLightbox = function (imageUrl) {
    const lightboxImage = document.getElementById("lightboxImage");
    if (lightboxModal && lightboxImage) {
      lightboxImage.src = imageUrl;
      lightboxModal.classList.add("open");
      lockBodyScroll();
    }
  };

  window.closeLightbox = function () {
    if (lightboxModal) {
      lightboxModal.classList.remove("open");
      unlockBodyScroll();
    }
  };

  if (lightboxModal) {
    lightboxModal.addEventListener("click", (e) => {
      if (e.target.id === "lightboxModal") closeLightbox();
    });
  }

  // PDF Viewer Modal
  window.openPdfViewerModal = function (pdfUrl, title) {
    const pdfViewerContent = document.getElementById("pdfViewerContent");
    const pdfViewerTitle = document.getElementById("pdfViewerTitle");
    const pdfDownloadLink = document.getElementById("pdfDownloadLink");

    if (
      pdfViewerModal &&
      pdfViewerContent &&
      pdfViewerTitle &&
      pdfDownloadLink
    ) {
      pdfViewerTitle.textContent = title;
      pdfDownloadLink.href = pdfUrl;
      pdfViewerContent.innerHTML = `<embed src="${pdfUrl}#view=FitH" type="application/pdf" width="100%" height="100%">`;
      lucide.createIcons(); // Panggil untuk membuat ikon download
      pdfViewerModal.classList.add("open");
      lockBodyScroll();
    }
  };

  window.closePdfViewerModal = function () {
    if (pdfViewerModal) pdfViewerModal.classList.remove("open");
    unlockBodyScroll();
  };

  if (pdfViewerModal) {
    pdfViewerModal.addEventListener("click", (e) => {
      if (e.target === pdfViewerModal) closePdfViewerModal();
    });
  }

  // Achievement Modal
  window.openAchievementModal = function () {
    populateAchievements();
    if (achievementModal) achievementModal.classList.add("open");
    lockBodyScroll();
  };

  window.closeAchievementModal = function () {
    if (achievementModal) achievementModal.classList.remove("open");
    unlockBodyScroll();
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

  // --- Global Escape Key Handler ---
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // Urutkan dari modal yang paling mungkin di atas
      if (lightboxModal && lightboxModal.classList.contains("open")) {
        closeLightbox();
      } else if (projectModal && projectModal.classList.contains("open")) {
        closeModal();
      } else if (pdfViewerModal && pdfViewerModal.classList.contains("open")) {
        closePdfViewerModal();
      } else if (
        achievementModal &&
        achievementModal.classList.contains("open")
      ) {
        closeAchievementModal();
      } else if (window.closeChatbotModal) {
        // Cek jika fungsi ada
        window.closeChatbotModal();
      }
    }
  });
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
/**
 * Menyorot teks dalam sebuah string berdasarkan query pencarian.
 * @param {string} text - Teks asli.
 * @param {string} query - Kata kunci pencarian.
 * @returns {string} Teks dengan kata kunci yang disorot.
 */
function highlightText(text, query) {
  if (!query || !text) {
    return text;
  }
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  return text.replace(regex, `<mark class="search-highlight">$1</mark>`);
}

let currentProjectFilter = "all";
let currentSearchQuery = "";
let currentProjectPage = 1;
const projectsPerPage = 6;

function renderProjects(
  projects,
  filter = currentProjectFilter,
  searchQuery = currentSearchQuery,
  page = currentProjectPage
) {
  const portfolioGrid = document.getElementById("portfolio-grid");
  if (!portfolioGrid) return;

  currentProjectFilter = filter;
  currentSearchQuery = searchQuery.toLowerCase();
  currentProjectPage = page;

  portfolioGrid.innerHTML = "";

  let filteredProjects =
    filter === "all" ? projects : projects.filter((p) => p.category === filter);

  // Logika Pencarian
  if (currentSearchQuery) {
    filteredProjects = filteredProjects.filter((p) => {
      const searchableText = [
        p.title,
        p.type,
        p.tag,
        ...(p.techStack ? p.techStack.map((t) => t.name) : []),
      ]
        .join(" ")
        .toLowerCase();
      return searchableText.includes(currentSearchQuery);
    });
  }

  // Logika Paginasi
  const startIndex = (page - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  if (filteredProjects.length === 0) {
    portfolioGrid.innerHTML = `<p class="col-span-full text-center" style="color: var(--text-secondary);">Tidak ada proyek dalam kategori ini.</p>`;
    renderPaginationControls(0, 0); // Kosongkan paginasi
    return;
  }

  if (paginatedProjects.length === 0 && page > 1) {
    // Jika halaman yang diminta kosong (misal: setelah filter), kembali ke halaman 1
    renderProjects(projects, filter, searchQuery, 1);
    return;
  }

  paginatedProjects.forEach((project, index) => {
    const projectCard = document.createElement("div");
    projectCard.className = `
      project-card p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer
      project-card p-6 transform hover:scale-105 transition-all duration-300 cursor-pointer liquid-glass-card
    `;
    projectCard.style.animationDelay = `${index * 75}ms`;
    projectCard.style.backgroundColor = "var(--bg-card-secondary)";
    projectCard.setAttribute("onclick", `openModal('${project.id}')`);

    // Sorot teks yang cocok dengan query pencarian
    const highlightedTitle = highlightText(project.title, currentSearchQuery);
    const highlightedType = highlightText(project.type, currentSearchQuery);
    const highlightedTag = highlightText(project.tag, currentSearchQuery);

    projectCard.innerHTML = `
      <img src="${project.thumbnail}" alt="Thumbnail untuk ${project.title}" class="rounded-lg mb-4 w-full h-48 object-cover" onerror="this.onerror=null;this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGE1NTY4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjIwIiBmaWxsPSIjZTJlOGYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5JbWFnZSBFcnJvciA8L3RleHQ+PC9zdmc+';">
      <h3 class="text-2xl font-bold mb-2" style="color: var(--text-white);">${highlightedTitle}</h3>
      <p class="text-lg mb-4" style="color: var(--text-secondary);">${highlightedType}</p>
      <span class="inline-block text-white text-xs font-semibold px-3 py-1 rounded-full" style="background-color: var(--color-accent);">${highlightedTag}</span>
    `;
    portfolioGrid.appendChild(projectCard);
  });

  renderPaginationControls(filteredProjects.length, page);
}

function renderPaginationControls(totalItems, currentPage) {
  const paginationContainer = document.getElementById("portfolio-pagination");
  if (!paginationContainer) return;
  paginationContainer.innerHTML = "";

  const portfolioGrid = document.getElementById("portfolio-grid");

  const totalPages = Math.ceil(totalItems / projectsPerPage);
  if (totalPages <= 1) return;

  const createButton = (text, page, isDisabled = false, isActive = false) => {
    const button = document.createElement("button");
    button.className = "pagination-btn";
    button.innerHTML = text;
    button.disabled = isDisabled;
    if (isActive) button.classList.add("active");
    if (!isDisabled) {
      button.addEventListener("click", () => {
        // --- Animasi Fade Out ---
        const existingCards = portfolioGrid.querySelectorAll(".project-card");
        existingCards.forEach((card, index) => {
          card.style.animationDelay = `${index * 50}ms`;
          card.classList.add("fading-out");
        });
        const totalFadeOutTime =
          300 +
          (existingCards.length > 0 ? (existingCards.length - 1) * 50 : 0);
        setTimeout(() => {
          renderProjects(
            projectsData,
            currentProjectFilter,
            currentSearchQuery,
            page
          );
        }, totalFadeOutTime);
        // --- End Animasi ---

        document
          .getElementById("portfolio")
          .scrollIntoView({ behavior: "smooth" });
      });
    }
    return button;
  };

  // Tombol "Sebelumnya"
  paginationContainer.appendChild(
    createButton("Sebelumnya", currentPage - 1, currentPage === 1)
  );

  // Tombol Halaman
  for (let i = 1; i <= totalPages; i++) {
    // Logika untuk menampilkan elipsis jika halaman terlalu banyak (opsional, untuk > 7 halaman)
    if (
      totalPages > 7 &&
      Math.abs(currentPage - i) > 2 &&
      i !== 1 &&
      i !== totalPages
    ) {
      if (!paginationContainer.querySelector(".ellipsis")) {
        const ellipsis = document.createElement("span");
        ellipsis.className = "ellipsis px-2 text-secondary";
        ellipsis.textContent = "...";
        paginationContainer.appendChild(ellipsis);
      }
      continue;
    }
    paginationContainer.appendChild(
      createButton(i.toString(), i, false, i === currentPage)
    );
  }

  // Tombol "Berikutnya"
  paginationContainer.appendChild(
    createButton("Berikutnya", currentPage + 1, currentPage === totalPages)
  );
}

// --- Debounce function for search input ---
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

// --- Initialize Search Functionality ---
function initializeProjectSearch(projects) {
  const searchInput = document.getElementById("portfolio-search-input");
  if (!searchInput) return;

  const debouncedSearch = debounce((query) => {
    renderProjects(projects, currentProjectFilter, query, 1); // Reset to page 1 on new search
  }, 300);

  searchInput.addEventListener("input", (e) => {
    debouncedSearch(e.target.value);
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
        renderProjects(projects, categoryKey, currentSearchQuery, 1); // Selalu mulai dari halaman 1 saat filter
      }, totalFadeOutTime);
    });

    filtersContainer.appendChild(button);
  });

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // Initialize search after filters are rendered
  initializeProjectSearch(projects);
}

// --- Interactive Skill Filtering ---
function initializeSkillFiltering() {
  // Menggunakan selector baru untuk kartu keahlian yang telah didesain ulang
  const skillCards = document.querySelectorAll(".skill-card-v2[data-skill]");
  const portfolioSection = document.getElementById("portfolio");
  const searchInput = document.getElementById("portfolio-search-input");

  skillCards.forEach((card) => {
    card.addEventListener("click", () => {
      const skill = card.dataset.skill;
      if (!skill) return;

      // Cek apakah ada tombol filter yang cocok dengan keahlian (misal: 'web', 'mobile')
      const filterButton = document.querySelector(
        `#portfolio-filters .filter-btn[data-filter="${skill}"]`
      );

      if (filterButton) {
        // Jika ada filter, gulir ke portofolio dan klik tombol filter tersebut
        portfolioSection.scrollIntoView({ behavior: "smooth" });
        // Tambahkan sedikit jeda agar scroll selesai sebelum filter diaktifkan
        setTimeout(() => {
          searchInput.value = ""; // Kosongkan pencarian jika menggunakan filter
          filterButton.click();
        }, 400);
      } else {
        // Jika tidak ada filter (misal: 'ai', 'erp'), gunakan fungsi pencarian
        portfolioSection.scrollIntoView({ behavior: "smooth" });
        searchInput.value = skill;
        // Picu event 'input' agar fungsi pencarian (dengan debounce) berjalan
        searchInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
  });
}

// --- Interactive Contact Cards ---
function initializeContactCards() {
  const contactCards = document.querySelectorAll(".contact-card-v2");

  contactCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // Tambahkan kelas animasi
      if (!card.classList.contains("is-clicked")) {
        card.classList.add("is-clicked");
        // Hapus kelas setelah animasi selesai agar bisa dipicu lagi
        card.addEventListener(
          "animationend",
          () => {
            card.classList.remove("is-clicked");
          },
          { once: true }
        );
      }
    });
  });
}

// --- Testimonial Rendering ---
function renderTestimonials(testimonials) {
  const testimonialsGrid = document.getElementById("testimonials-grid");
  if (!testimonialsGrid) return;
  testimonialsGrid.innerHTML = "";

  testimonialsGrid.innerHTML = testimonials
    .map(
      (testimonial, index) => `
      <div class="testimonial-card-v2" style="animation-delay: ${
        index * 100
      }ms;">
        <div class="testimonial-quote-icon">
          <i data-lucide="quote"></i>
        </div>
        <p class="testimonial-quote">${parseMarkdownBold(testimonial.quote)}</p>
        <div class="testimonial-author">
          <img src="${testimonial.avatar}" alt="Avatar ${
        testimonial.name
      }" class="testimonial-avatar">
          <div>
            <p class="testimonial-name">${testimonial.name}</p>
            <p class="testimonial-title">${testimonial.title}</p>
          </div>
        </div>
      </div>
    `
    )
    .join("");

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// --- Achievement System UI ---
let paletteGenerationCount = parseInt(
  localStorage.getItem("paletteCount") || "0"
);

function showToast(achievementName) {
  const Toast = Swal.mixin({
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  Toast.fire({
    icon: "success",
    title: "Pencapaian Terbuka!",
    html: achievementName,
  });
}

window.resetAchievements = function () {
  // Hapus data dari localStorage
  localStorage.removeItem("portfolioAchievements");
  localStorage.removeItem("appliedThemes");
  localStorage.removeItem("paletteCount");

  // Reset status di memori
  if (typeof achievements !== "undefined") {
    for (const id in achievements) {
      if (Object.prototype.hasOwnProperty.call(achievements, id)) {
        achievements[id].unlocked = false;
      }
    }
  }

  // Reset counter
  paletteGenerationCount = 0;

  // Beri notifikasi
  const Toast = Swal.mixin({
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
  Toast.fire({
    icon: "info",
    title: "Pencapaian telah direset.",
  });
};

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

  // Hapus elemen hint/reward lama jika ada, untuk mencegah duplikasi
  const oldHint = document.getElementById("achievement-hint-section");
  if (oldHint) oldHint.remove();
  const oldReward = document.getElementById("achievement-reward-section");
  if (oldReward) oldReward.remove();

  const showReward =
    unlockedCount === totalAchievements ||
    (typeof DEBUG_CERTIFICATE !== "undefined" && DEBUG_CERTIFICATE === true);

  if (showReward) {
    // Buat dan tambahkan reward section
    const rewardSection = document.createElement("div");
    rewardSection.id = "achievement-reward-section";
    rewardSection.className = "p-3 mt-4 border-t";
    rewardSection.style.borderColor = "var(--border-color)";
    rewardSection.style.backgroundColor = "rgba(var(--color-accent-rgb), 0.05)";
    rewardSection.innerHTML = `
      <div class="flex flex-col md:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-3 text-left">
          <i data-lucide="gift" class="w-8 h-8 text-accent flex-shrink-0"></i>
          <div>
            <h4 class="font-bold text-base" style="color: var(--text-white);">Klaim Hadiah Spesial Anda</h4>
            <p class="text-xs" style="color: var(--text-secondary);">Selamat! Anda telah membuka semua pencapaian.</p>
          </div>
        </div>
        <div class="flex-shrink-0 w-full md:w-auto">
          <div class="flex gap-2">
            <input type="text" id="certificate-name-input" class="form-input !py-2 !pl-3 text-sm flex-grow" placeholder="Nama Anda...">
            <button id="generate-certificate-btn" class="btn-primary !py-2 !px-4 text-sm whitespace-nowrap">Buat</button>
          </div>
        </div>
      </div>`;
    achievementGrid.parentElement.appendChild(rewardSection);
    initializeCertificateGenerator(); // Inisialisasi ulang event listener untuk tombol yang baru dibuat
  } else {
    // Buat dan tambahkan hint section
    const hintSection = document.createElement("div");
    hintSection.id = "achievement-hint-section";
    hintSection.className = "achievement-hint-banner achievement-hint-pulse";
    hintSection.innerHTML = `
      <div class="aurora">
        <div class="aurora__item"></div>
        <div class="aurora__item"></div>
        <div class="aurora__item"></div>
        <div class="aurora__item"></div>
      </div>
      <div class="flex items-center justify-center gap-3 relative z-10">
        <i data-lucide="gift" class="w-6 h-6 text-accent"></i>
        <p class="text-sm font-semibold text-center" style="color: var(--text-accent);">Selesaikan semua pencapaian untuk membuka hadiah spesial!</p>
      </div>`;
    achievementGrid.parentElement.appendChild(hintSection);
    achievementGrid.classList.add("has-hint");
  }

  if (progressBar && progressText) {
    const percentage =
      totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0;
    const container = progressBar.parentElement;

    // --- LOGIKA ANIMASI BARU ---
    // Hapus kelas animasi agar bisa dipicu lagi
    progressBar.classList.remove("is-animating");
    // Tambahkan kembali kelas setelah jeda singkat untuk me-restart animasi
    // `requestAnimationFrame` memastikan browser siap untuk perubahan DOM
    requestAnimationFrame(() => progressBar.classList.add("is-animating"));

    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${unlockedCount}/${totalAchievements}`;

    container.classList.toggle("completed", percentage >= 100);
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

  // WhatsApp fields
  const whatsappCodeSelect = document.getElementById("whatsapp_code");
  const whatsappLocalInput = document.getElementById("whatsapp_local");
  const whatsappFullInput = document.getElementById("whatsapp"); // hidden
  const submissionStatus = document.getElementById("form-submission-status");

  const COOLDOWN_MINUTES = 5;
  const lastSubmission = parseInt(
    localStorage.getItem("lastContactSubmission") || "0"
  );
  const timeSinceLastSubmission = Date.now() - lastSubmission;

  let cooldownInterval;

  // === 1) Deklarasi validator & state PALING ATAS ===
  const validators = {
    name: (value) => /^[a-zA-Z\s'-]{2,50}$/.test(value.trim()),
    email: (value) =>
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        value
      ),
    whatsapp: (value) => /^\+\d{9,15}$/.test(value.trim()),
    message: (value) => value.trim().length >= 10,
  };

  const errorMessages = {
    name: "Nama harus berisi minimal 2 karakter huruf.",
    email: "Format email tidak valid.",
    whatsapp: "Nomor tidak valid. Pastikan panjangnya sesuai.",
    message: "Pesan harus berisi minimal 10 karakter.",
  };

  const validationState = {
    name: false,
    email: false,
    whatsapp: false,
    message: false,
  };

  // === 2) Helper yang menggunakan validator/state ===
  function updateAndValidateWhatsapp() {
    const code = whatsappCodeSelect.value;
    const local = whatsappLocalInput.value.trim().replace(/^0+/, "");
    const fullNumber = `+${code}${local}`;
    whatsappFullInput.value = fullNumber;

    const isValid = validators.whatsapp(fullNumber);
    validationState.whatsapp = isValid;

    const inputGroup = whatsappLocalInput.closest(".form-input-group");
    const errorElement = inputGroup.nextElementSibling;

    inputGroup.classList.toggle("valid", isValid);
    inputGroup.classList.toggle("invalid", !isValid);
    errorElement.textContent = !isValid ? errorMessages.whatsapp : "";

    submitButton.disabled = !Object.values(validationState).every(Boolean);
  }

  function validateField(input) {
    const isValid = validators[input.id](input.value);
    const errorElement = input.parentElement.nextElementSibling;
    validationState[input.id] = isValid;

    input.classList.toggle("valid", isValid);
    input.classList.toggle("invalid", !isValid);
    errorElement.textContent = !isValid ? errorMessages[input.id] : "";

    submitButton.disabled = !Object.values(validationState).every(Boolean);
  }

  function populateCountryCodes() {
    if (typeof countryPhoneCodes === "undefined" || !whatsappCodeSelect) return;

    whatsappCodeSelect.innerHTML = "";
    countryPhoneCodes.forEach((country) => {
      const option = document.createElement("option");
      option.value = country.code.replace(/[^0-9]/g, "");
      option.textContent = `${country.name} (+${option.value})`;
      option.dataset.name = country.name;
      // --- PERBAIKAN: Gunakan 'iso' sebagai 'data-code' untuk flag-icon-css ---
      option.dataset.code = country.iso; // 'iso' berisi kode negara 2 huruf (mis: 'ID', 'US')
      if (country.iso === "ID") option.selected = true;
      whatsappCodeSelect.appendChild(option);
    });

    const customSelectWrapper = whatsappCodeSelect.closest(
      ".form-input-group-addon"
    );
    if (customSelectWrapper && typeof createCustomSelect === "function") {
      createCustomSelect(customSelectWrapper, updateAndValidateWhatsapp);
    }
  }

  function activateCooldownMode(messagePrefix = "Terlalu cepat!") {
    const allInputs = [
      nameInput,
      emailInput,
      whatsappLocalInput,
      messageInput,
      whatsappCodeSelect,
    ];
    allInputs.forEach((input) => (input.disabled = true));
    submitButton.disabled = true;

    const customToggle = document.querySelector(
      ".form-input-group-addon .custom-select-toggle"
    );
    if (customToggle) {
      customToggle.style.pointerEvents = "none";
      customToggle.style.opacity = "0.6";
    }

    if (cooldownInterval) clearInterval(cooldownInterval);
    const cooldownEndTime =
      parseInt(localStorage.getItem("lastContactSubmission") || "0") +
      COOLDOWN_MINUTES * 60 * 1000;

    const updateCooldownMessage = () => {
      const timeRemainingMs = cooldownEndTime - Date.now();

      if (timeRemainingMs <= 0) {
        submissionStatus.innerHTML = `
          <div class="flex items-center justify-center gap-2 text-green-400">
            <i data-lucide="check-circle" class="w-4 h-4"></i>
            <span>Anda sudah bisa mengirim pesan lagi.</span>
          </div>`;
        allInputs.forEach((input) => (input.disabled = false));
        submitButton.disabled = !Object.values(validationState).every(Boolean);

        if (customToggle) {
          customToggle.style.pointerEvents = "";
          customToggle.style.opacity = "";
        }

        lucide.createIcons();
        clearInterval(cooldownInterval);
        return;
      }

      const minutes = Math.floor(timeRemainingMs / 60000);
      const seconds = Math.floor((timeRemainingMs % 60000) / 1000);
      const timeString = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;

      submissionStatus.innerHTML = `
        <div class="flex items-center justify-center gap-2 text-yellow-400">
          <i data-lucide="timer" class="w-4 h-4"></i>
          <span>${messagePrefix} Coba lagi dalam <strong>${timeString}</strong></span>
        </div>`;
      lucide.createIcons();
    };

    updateCooldownMessage();
    cooldownInterval = setInterval(updateCooldownMessage, 1000);
  }

  // === 3) Pasang event listeners ===
  [nameInput, emailInput, messageInput].forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => {
      if (input.classList.contains("invalid")) validateField(input);
      if (submissionStatus.innerHTML !== "") submissionStatus.innerHTML = "";
    });
  });

  whatsappCodeSelect.addEventListener("change", updateAndValidateWhatsapp);
  whatsappLocalInput.addEventListener("input", updateAndValidateWhatsapp);
  whatsappLocalInput.addEventListener("blur", updateAndValidateWhatsapp);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const lastSubmissionCheck = parseInt(
      localStorage.getItem("lastContactSubmission") || "0"
    );
    const timeSinceLastCheck = Date.now() - lastSubmissionCheck;
    if (timeSinceLastCheck < COOLDOWN_MINUTES * 60 * 1000) {
      activateCooldownMode("Aksi diblokir.");
      return;
    }

    if (Object.values(validationState).every(Boolean)) {
      const submitText = submitButton.querySelector(".submit-text");
      const submitSpinner = submitButton.querySelector(".submit-spinner");
      submitText.classList.add("hidden");
      submissionStatus.innerHTML = "";
      submitSpinner.classList.remove("hidden");

      [
        nameInput,
        emailInput,
        whatsappLocalInput,
        whatsappCodeSelect,
        messageInput,
      ].forEach((i) => i.setAttribute("readonly", true));
      submitButton.disabled = true;
      lucide.createIcons();

      const formData = new FormData(form);
      const formAction = `https://formspree.io/f/${FORMSPREE_ID}`;

      fetch(formAction, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      })
        .then((response) => {
          if (response.ok) {
            localStorage.setItem(
              "lastContactSubmission",
              Date.now().toString()
            );
            Swal.fire({
              icon: "success",
              title: "Pesan Terkirim!",
              text: "Terima kasih telah menghubungi saya. Saya akan segera merespons.",
            });
            form.reset();
            submitButton.disabled = true;
            [nameInput, emailInput, messageInput].forEach((i) =>
              i.classList.remove("valid")
            );
            whatsappLocalInput
              .closest(".form-input-group")
              .classList.remove("valid");
          } else {
            throw new Error("Network response was not ok.");
          }
        })
        .catch(() => {
          submissionStatus.innerHTML = `
            <div class="flex items-center justify-center gap-2 text-red-400">
              <i data-lucide="alert-triangle" class="w-4 h-4"></i>
              <span>Gagal mengirim pesan. Silakan coba lagi nanti.</span>
            </div>`;
        })
        .finally(() => {
          submitText.classList.remove("hidden");
          submitSpinner.classList.add("hidden");
          [
            nameInput,
            emailInput,
            whatsappLocalInput,
            whatsappCodeSelect,
            messageInput,
          ].forEach((i) => i.removeAttribute("readonly"));
          submitButton.disabled =
            !Object.values(validationState).every(Boolean);
          lucide.createIcons();
        });
    }
  });

  // === 4) Bangun UI + nilai awal, lalu cek cooldown ===
  populateCountryCodes();
  updateAndValidateWhatsapp();

  if (timeSinceLastSubmission < COOLDOWN_MINUTES * 60 * 1000) {
    activateCooldownMode(); // TANPA return
  }
}

// --- Work History Rendering ---
function renderWorkHistory(history) {
  const timelineContainer = document.getElementById("work-history-timeline");
  if (!timelineContainer) return;
  timelineContainer.innerHTML = "";

  timelineContainer.innerHTML = history
    .map(
      (item, index) => `
      <div class="timeline-item-v2">
        <div class="timeline-content-v2">
          <div class="flex items-start gap-4">
            <img src="${item.logo}" alt="Logo ${item.company}" class="timeline-logo-v2" loading="lazy" onerror="this.style.display='none'">
            <div class="flex-grow text-left">
              <p class="timeline-duration-v2">${item.duration}</p>
              <h4 class="timeline-role-v2">${item.role}</h4>
              <p class="timeline-company-v2">${item.company}</p>
            </div>
          </div>
          <p class="timeline-description-v2">${item.description}</p>
        </div>
      </div>
    `
    )
    .join("");

  // Initialize Intersection Observer for animations
  const timelineItems = timelineContainer.querySelectorAll(".timeline-item-v2");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  timelineItems.forEach((item) => observer.observe(item));
}

/**
 * Generates a thumbnail from the first page of a PDF and renders it onto a canvas.
 * @param {string} pdfUrl - The URL of the PDF file.
 * @param {string} canvasId - The ID of the canvas element to render to.
 */
async function generatePdfThumbnail(pdfUrl, canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  try {
    // --- PERBAIKAN DENGAN RESIZEOBSERVER ---
    const renderPdf = async (rect) => {
      // Langkah 2: Sesuaikan resolusi internal canvas agar tajam di layar HiDPI.
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      // Langkah 3: Isi latar belakang canvas utama dengan warna tema.
      const themeBgColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--bg-primary")
        .trim();
      ctx.fillStyle = themeBgColor;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Ensure pdf.js worker is configured
      if (
        typeof pdfjsLib === "undefined" ||
        !pdfjsLib.GlobalWorkerOptions.workerSrc
      ) {
        throw new Error("PDF.js library or worker not loaded.");
      }

      // Langkah 4: Muat PDF dan render ke canvas sementara dengan latar belakang putih.
      const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2.0 }); // Skala tinggi untuk kualitas

      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = viewport.width;
      tempCanvas.height = viewport.height;

      await page.render({
        canvasContext: tempCtx,
        viewport: viewport,
        background: "rgba(255, 255, 255, 1)",
      }).promise;

      // Langkah 5: Gambar hasil dari canvas sementara ke canvas utama dengan logika 'contain'.
      const hRatio = rect.width / tempCanvas.width;
      const vRatio = rect.height / tempCanvas.height;
      const ratio = Math.min(hRatio, vRatio);
      const centerShift_x = (rect.width - tempCanvas.width * ratio) / 2;
      const centerShift_y = (rect.height - tempCanvas.height * ratio) / 2;

      ctx.drawImage(
        tempCanvas,
        0,
        0,
        tempCanvas.width,
        tempCanvas.height,
        centerShift_x,
        centerShift_y,
        tempCanvas.width * ratio,
        tempCanvas.height * ratio
      );
    };

    // Langkah 1: Gunakan ResizeObserver untuk menunggu canvas memiliki ukuran.
    const observer = new ResizeObserver((entries) => {
      if (
        entries[0].contentRect.width > 0 &&
        entries[0].contentRect.height > 0
      ) {
        renderPdf(entries[0].contentRect);
        observer.unobserve(canvas); // Hentikan observasi setelah render pertama berhasil
      }
    });
    observer.observe(canvas);
  } catch (error) {
    console.error("Error rendering PDF thumbnail:", error);
    // Draw a fallback error message on the canvas
    ctx.fillStyle = "#4A5568"; // bg-card-secondary
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#e2e8f0"; // text-white
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Gagal memuat", canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillText("pratinjau PDF", canvas.width / 2, canvas.height / 2 + 10);
  }
}

// --- State untuk Paginasi Sertifikat ---
let currentCertificatePage = 1;
const certsPerPage = 6;

// --- Kontrol Paginasi untuk Sertifikat ---
function renderCertificatePaginationControls(totalItems, currentPage) {
  const paginationContainer = document.getElementById("certificate-controls");
  const certificatesGrid = document.getElementById("certificates-grid");
  if (!paginationContainer) return;
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(totalItems / certsPerPage);
  if (totalPages <= 1) return;

  const createButton = (text, page, isDisabled = false, isActive = false) => {
    const button = document.createElement("button");
    button.className = "pagination-btn";
    button.innerHTML = text;
    button.disabled = isDisabled;
    if (isActive) button.classList.add("active");
    if (!isDisabled) {
      button.addEventListener("click", () => {
        // --- Animasi Fade Out ---
        const existingCards =
          certificatesGrid.querySelectorAll(".certificate-card");
        existingCards.forEach((card, index) => {
          card.style.animationDelay = `${index * 50}ms`;
          card.classList.add("fading-out");
        });
        const totalFadeOutTime =
          300 +
          (existingCards.length > 0 ? (existingCards.length - 1) * 50 : 0);
        setTimeout(() => {
          renderCertificates(certificatesData, page);
        }, totalFadeOutTime);
        document
          .getElementById("certificates")
          .scrollIntoView({ behavior: "smooth" });
      });
    }
    return button;
  };

  // Tombol "Sebelumnya"
  paginationContainer.appendChild(
    createButton("Sebelumnya", currentPage - 1, currentPage === 1)
  );

  // Tombol Halaman
  for (let i = 1; i <= totalPages; i++) {
    if (
      totalPages > 7 &&
      Math.abs(currentPage - i) > 2 &&
      i !== 1 &&
      i !== totalPages
    ) {
      if (!paginationContainer.querySelector(".ellipsis")) {
        const ellipsis = document.createElement("span");
        ellipsis.className = "ellipsis px-2 text-secondary";
        ellipsis.textContent = "...";
        paginationContainer.appendChild(ellipsis);
      }
      continue;
    }
    paginationContainer.appendChild(
      createButton(i.toString(), i, false, i === currentPage)
    );
  }

  // Tombol "Berikutnya"
  paginationContainer.appendChild(
    createButton("Berikutnya", currentPage + 1, currentPage === totalPages)
  );
}

// --- Certificates Rendering ---
function renderCertificates(certificates, page = currentCertificatePage) {
  const certificatesGrid = document.getElementById("certificates-grid");
  const controlsContainer = document.getElementById("certificate-controls");

  if (!certificatesGrid || !controlsContainer) return;

  currentCertificatePage = page;
  certificatesGrid.innerHTML = "";

  const startIndex = (page - 1) * certsPerPage;
  const endIndex = startIndex + certsPerPage;
  const paginatedCertificates = certificates.slice(startIndex, endIndex);

  paginatedCertificates.forEach((cert, index) => {
    const certCard = document.createElement("div");
    certCard.className = "certificate-card fading-in";
    certCard.style.animationDelay = `${index * 75}ms`;

    const isPdf = cert.url.endsWith(".pdf");
    const actionHtml = isPdf
      ? `onclick="openPdfViewerModal('${cert.url}', '${cert.title}')"`
      : `href="${cert.url}" target="_blank" rel="noopener noreferrer"`;

    const isThumbnailPdf = cert.thumbnail.endsWith(".pdf");
    const canvasId = `cert-canvas-${index}`;
    const thumbnailHtml = isThumbnailPdf
      ? `<canvas id="${canvasId}" class="certificate-thumbnail" width="400" height="200"></canvas>` // width/height ini menentukan resolusi, bukan ukuran display
      : `<img src="${cert.thumbnail}" alt="Sertifikat ${cert.title}" class="certificate-thumbnail" loading="lazy" onerror="this.onerror=null;this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGE1NTY4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjIwIiBmaWxsPSIjZTJlOGYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5JbWFnZSBFcnJvciA8L3RleHQ+PC9zdmc+';">`;

    const cardContent = `
      <div class="certificate-thumbnail-wrapper">
        ${thumbnailHtml}
        <div class="thumbnail-overlay">
          <div class="overlay-content">
            <i data-lucide="eye" class="w-8 h-8"></i>
          </div>
        </div>
      </div>
      <div class="certificate-info">
        <h4 class="text-lg font-bold mb-1" style="color: var(--text-white);">${
          cert.title
        }</h4>
        <p class="text-sm mb-3" style="color: var(--text-secondary);">${
          cert.issuer
        } - ${cert.date}</p>
        <div class="mt-auto"> <!-- Wrapper untuk mendorong tombol ke bawah -->
          <span class="btn-secondary inline-flex items-center gap-2 text-xs !py-1.5 !px-3">
            <i data-lucide="${
              isPdf ? "eye" : "check-circle"
            }" class="w-4 h-4"></i>
            <span>${isPdf ? "Lihat PDF" : "Verifikasi"}</span>
          </span>
        </div>
      </div>
    `;

    // Jika bukan PDF, bungkus dengan <a>. Jika PDF, gunakan div dengan onclick.
    certCard.innerHTML = `
      <${isPdf ? "div" : "a"} ${actionHtml} class="block cursor-pointer">
        ${cardContent}
      </${isPdf ? "div" : "a"}>
    `;
    certificatesGrid.appendChild(certCard);

    // If the thumbnail was a PDF, call the function to render it on the canvas
    if (isThumbnailPdf) {
      generatePdfThumbnail(cert.thumbnail, canvasId);
    }
  });

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  renderCertificatePaginationControls(certificates.length, page);
}

// --- Populate Schema.org JSON-LD ---
function populateSchemaData() {
  if (typeof siteConfig === "undefined") return;

  const schemaScript = document.querySelector(
    'script[type="application/ld+json"]'
  );
  if (!schemaScript) return;

  try {
    const schema = JSON.parse(schemaScript.textContent);

    // Update data yang relevan
    schema.url = window.location.origin + window.location.pathname;
    schema.sameAs = [
      siteConfig.social.linkedin,
      siteConfig.social.whatsapp,
      `mailto:${siteConfig.email}`,
    ];
    schema.contactPoint.telephone = siteConfig.phone;

    schemaScript.textContent = JSON.stringify(schema, null, 2);
  } catch (error) {
    console.error("Gagal mem-parsing atau memperbarui skema JSON-LD:", error);
  }
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

function initializeServiceCardHover() {
  // Gabungkan selector untuk kedua jenis kartu
  const cards = document.querySelectorAll(".service-card-v2, .skill-card-v2");
  if (!cards.length) return;

  let ticking = false;

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty("--mouse-x", `${x}px`);
          card.style.setProperty("--mouse-y", `${y}px`);
          ticking = false;
        });
        ticking = true;
      }
    });
  });
}

// --- Directional Hover for Desktop Nav ---
function initializeDirectionalNavHover() {
  const navLinks = document.querySelectorAll(".desktop-nav .nav-link-anchor");
  if (!navLinks.length) return;

  const getDirection = (element, event) => {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left; // Posisi X mouse relatif terhadap elemen
    const w = rect.width;

    // Jika mouse masuk dari separuh kiri, arahnya 'left', selain itu 'right'
    return x < w / 2 ? "left" : "right";
  };

  navLinks.forEach((link) => {
    const wrapper = link.querySelector(".liquid-glass-wrapper");
    if (!wrapper) return;

    link.addEventListener("mouseenter", (e) => {
      const direction = getDirection(link, e);
      // Hapus semua kelas arah sebelumnya untuk memastikan reset
      link.classList.remove(
        "hover-from-top",
        "hover-from-bottom",
        "hover-from-left",
        "hover-from-right"
      );
      // Tambahkan kelas arah masuk yang baru
      link.classList.add(`hover-from-${direction}`);
    });
  });
}
