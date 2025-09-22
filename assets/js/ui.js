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

// --- Modals (Project, Achievement, Confirm) ---
function initializeModals() {
  const projectModal = document.getElementById("projectModal");
  const achievementModal = document.getElementById("achievementModal");

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
      document.getElementById("modalGoal").textContent = project.goal || "";
      document.getElementById("modalProcess").textContent =
        project.process || "";
      document.getElementById("modalImpact").textContent = project.impact || "";

      const modalImages = document.getElementById("modalImages");
      modalImages.innerHTML = "";
      if (project.images && project.images.length > 0) {
        project.images.forEach((imgData) => {
          const imgElement = document.createElement("img");
          imgElement.src = imgData.src;
          imgElement.alt = imgData.alt;
          imgElement.className =
            "rounded-lg w-full h-auto object-cover shadow-md";
          imgElement.onerror = function () {
            this.onerror = null;
            this.src =
              "https://placehold.co/400x200/4a5568/e2e8f0?text=Image+Error";
          };
          modalImages.appendChild(imgElement);
        });
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
function renderProjects(projects) {
  const portfolioGrid = document.getElementById("portfolio-grid");
  if (!portfolioGrid) return;
  portfolioGrid.innerHTML = "";

  projects.forEach((project) => {
    const projectCard = document.createElement("div");
    projectCard.className =
      "p-6 rounded-xl shadow-lg transform hover:scale-105 transition duration-300 cursor-pointer";
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
