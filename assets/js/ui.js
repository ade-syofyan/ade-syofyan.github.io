// js/ui.js

// --- Theme Management ---
function initializeTheme() {
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const themeDropdown = document.getElementById("theme-dropdown");
  const themeOptions = document.querySelectorAll(".theme-option");
  const mobileThemeContainer = document.getElementById("mobile-theme-switcher");

  const applyTheme = (theme) => {
    if (theme === "system") {
      document.documentElement.removeAttribute("data-theme");
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      updateIcons(systemTheme, true);
    } else {
      document.documentElement.setAttribute("data-theme", theme);
      updateIcons(theme, false);
    }
    localStorage.setItem("theme", theme);
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
        btn.classList.toggle("bg-accent", btn.dataset.themeValue === theme);
        btn.classList.toggle("text-white", btn.dataset.themeValue === theme);
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
}

// --- Mobile Menu ---
function initializeMobileMenu() {
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileMenuToggleBtn = document.getElementById("mobileMenuToggleBtn");

  window.toggleMobileMenu = function () {
    const isOpen = mobileMenu.classList.toggle("open");
    if (mobileMenuToggleBtn) {
      mobileMenuToggleBtn.setAttribute("aria-expanded", isOpen.toString());
    }
    document.body.style.overflow = isOpen ? "hidden" : "";
  };

  window.closeMobileMenu = function () {
    mobileMenu.classList.remove("open");
    document.body.style.overflow = "";
    if (mobileMenuToggleBtn) {
      mobileMenuToggleBtn.setAttribute("aria-expanded", "false");
    }
    setTimeout(() => {
      highlightNavLinkOnScroll();
    }, 100);
  };
}

// --- Helper Functions ---
function parseMarkdownBold(text) {
  if (!text) return "";
  // Mengganti **teks** dengan tag <strong> yang diberi gaya
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

            // Position tooltip above the tag
            let top = tagRect.top - tooltipRect.height - 8; // 8px gap
            let left = tagRect.left + tagRect.width / 2 - tooltipRect.width / 2;

            // Adjust if it goes off-screen
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
              "https://placehold.co/400x200/4a5568/e2e8f0?text=Image+Error";
          };
          // Tambahkan event listener untuk membuka lightbox saat gambar diklik
          imgElement.addEventListener("click", () => openLightbox(imgData.src));
          modalImages.appendChild(imgElement);
        });
      }

      // Tambahkan tautan eksternal (Play Store, dll.)
      const modalLinks = document.getElementById("modalLinks");
      modalLinks.innerHTML = ""; // Bersihkan tautan sebelumnya
      if (project.links) {
        if (project.links.playStore) {
          const linkEl = document.createElement("a");
          linkEl.href = project.links.playStore;
          linkEl.target = "_blank";
          linkEl.rel = "noopener noreferrer"; // Keamanan
          linkEl.className = "btn-secondary inline-flex items-center gap-2";
          linkEl.innerHTML = `<i data-lucide="play-circle"></i>Lihat di Play Store`;
          modalLinks.appendChild(linkEl);
        }
        if (project.links.liveSite) {
          const linkEl = document.createElement("a");
          linkEl.href = project.links.liveSite;
          linkEl.target = "_blank";
          linkEl.rel = "noopener noreferrer"; // Keamanan
          linkEl.className = "btn-secondary inline-flex items-center gap-2";
          linkEl.innerHTML = `<i data-lucide="external-link"></i>Kunjungi Situs`;
          modalLinks.appendChild(linkEl);
        }
        // Anda bisa menambahkan jenis tautan lain di sini (misal: appStore, github)

        // Panggil kembali createIcons karena kita menambahkan ikon baru secara dinamis
        if (typeof lucide !== "undefined") {
          lucide.createIcons();
        }
      }
      projectModal.classList.add("open");
    }
  };

  window.closeModal = function () {
    if (projectModal) projectModal.classList.remove("open");
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
    }
  };

  window.closeLightbox = function () {
    if (lightboxModal) {
      lightboxModal.classList.remove("open");
    }
  };

  if (lightboxModal) {
    // Tutup lightbox saat mengklik area overlay (di luar gambar)
    lightboxModal.addEventListener("click", (e) => {
      if (e.target.id === "lightboxModal") closeLightbox();
    });
  }

  // Achievement Modal
  window.openAchievementModal = function () {
    populateAchievements();
    if (achievementModal) achievementModal.classList.add("open");
  };

  window.closeAchievementModal = function () {
    if (achievementModal) achievementModal.classList.remove("open");
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

  filteredProjects.forEach((project) => {
    const projectCard = document.createElement("div");
    // Tambahkan animasi fade-in
    projectCard.className = `
      p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer
      opacity-0 animate-fade-in
    `;
    projectCard.style.backgroundColor = "var(--bg-card-secondary)";
    projectCard.setAttribute("onclick", `openModal('${project.id}')`);

    projectCard.innerHTML = `
            <img
            src="${project.thumbnail}"
            alt="Thumbnail untuk ${project.title}"
            class="rounded-lg mb-4 w-full h-48 object-cover"
            onerror="this.onerror=null;this.src='https://placehold.co/400x200/4a5568/e2e8f0?text=Image+Error';"
            />
            <h3 class="text-2xl font-bold mb-2" style="color: var(--text-white);">${project.title}</h3>
            <p class="text-lg mb-4" style="color: var(--text-secondary);">${project.type}</p>
            <span class="inline-block text-white text-xs font-semibold px-3 py-1 rounded-full" style="background-color: var(--color-accent);">${project.tag}</span>
        `;
    portfolioGrid.appendChild(projectCard);
  });
  // Memicu reflow untuk memastikan animasi berjalan
  void portfolioGrid.offsetWidth;
  portfolioGrid
    .querySelectorAll(".animate-fade-in")
    .forEach((card) => card.classList.remove("opacity-0"));
}

// --- Project Filter Rendering ---
function renderProjectFilters(projects) {
  const filtersContainer = document.getElementById("portfolio-filters");
  if (!filtersContainer) return;

  // Definisikan detail untuk setiap kategori, termasuk ikon
  const categoryDetails = {
    all: { name: "Semua", icon: "layout-grid" },
    web: { name: "Web", icon: "globe" },
    mobile: { name: "Mobile", icon: "smartphone" },
  };

  // Ambil kategori unik dari data proyek dan pastikan 'all' ada di urutan pertama
  const projectCategories = [...new Set(projects.map((p) => p.category))];
  const orderedCategories = [
    "all",
    ...projectCategories.filter((cat) => cat !== "all"),
  ];

  orderedCategories.forEach((categoryKey) => {
    const details = categoryDetails[categoryKey];
    if (!details) return; // Lewati jika kategori tidak terdefinisi

    const button = document.createElement("button");
    button.className = "filter-btn";
    button.dataset.filter = categoryKey;
    button.innerHTML = `<i data-lucide="${details.icon}" class="w-4 h-4 mr-2"></i><span>${details.name}</span>`;

    if (categoryKey === "all") {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      filtersContainer
        .querySelectorAll(".filter-btn")
        .forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      renderProjects(projects, categoryKey);
    });

    filtersContainer.appendChild(button);
  });

  // Panggil kembali createIcons untuk merender ikon yang baru ditambahkan
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

      // Cari tombol filter yang sesuai di bagian portofolio
      const filterButton = document.querySelector(
        `#portfolio-filters .filter-btn[data-filter="${skill}"]`
      );

      if (filterButton) {
        // Gulir ke bagian portofolio
        portfolioSection.scrollIntoView({ behavior: "smooth" });

        // Tunggu sebentar agar scroll selesai, lalu klik tombol filter
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
    testimonialCard.className = "bg-card p-6 rounded-xl shadow-lg text-left";

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
  }
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
  if (!achievementGrid) return;
  achievementGrid.innerHTML = "";

  const unlockedIds = JSON.parse(
    localStorage.getItem("portfolioAchievements") || "[]"
  );

  for (const id in achievements) {
    const ach = achievements[id];
    const isUnlocked = unlockedIds.includes(id);

    const card = document.createElement("div");
    card.className = `p-4 rounded-lg flex items-center gap-4 transition-all duration-300 ${
      isUnlocked ? "opacity-100" : "opacity-40"
    }`;
    card.style.backgroundColor = "var(--bg-card-secondary)";

    card.innerHTML = `
            <div class="text-accent"><i data-lucide="${
              ach.icon || "award"
            }" class="w-8 h-8"></i></div>
            <div>
                <p class="font-semibold" style="color: var(--text-white);">${
                  ach.name
                }</p>
                <p class="text-sm" style="color: var(--text-secondary);">${
                  isUnlocked ? ach.description : "???"
                }</p>
            </div>`;
    achievementGrid.appendChild(card);
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
        scrollToTopBtn.style.display = "block";
      } else {
        scrollToTopBtn.style.display = "none";
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
  document.getElementById("nav-brand").textContent = siteConfig.name;

  // Hero Section
  document.getElementById(
    "hero-title"
  ).innerHTML = `Halo, saya <span class="text-accent">${siteConfig.name}</span>`;
  document.getElementById(
    "hero-subtitle"
  ).innerHTML = `<span class="font-semibold">${siteConfig.jobTitleShort}</span> dengan keahlian memecahkan masalah. Membangun solusi digital inovatif dari ide hingga implementasi.`;

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

  // JSON-LD Schema
  // (Implementasi lebih lanjut bisa dilakukan di sini jika diperlukan)
}
