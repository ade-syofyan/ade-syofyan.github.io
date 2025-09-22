// js/components.js

// --- Live Demo: Real-time Visitor Counter ---
function initializeVisitorCounter() {
  const visitorCountElement = document.getElementById("visitor-count");
  if (!visitorCountElement) return;

  let currentVisitors = Math.floor(Math.random() * (300 - 150 + 1)) + 150;
  visitorCountElement.textContent = currentVisitors;

  function updateVisitorCount() {
    const fluctuation = Math.floor(Math.random() * 5) - 2;
    currentVisitors = Math.max(100, currentVisitors + fluctuation);

    visitorCountElement.classList.add("pop-in");
    visitorCountElement.textContent = currentVisitors;

    setTimeout(() => {
      visitorCountElement.classList.remove("pop-in");
    }, 300);

    const nextUpdateDelay = Math.random() * (4000 - 2000) + 2000;
    setTimeout(updateVisitorCount, nextUpdateDelay);
  }
  setTimeout(updateVisitorCount, 2500);
}

// --- Live Demo: Color Palette Generator ---
function initializePaletteGenerator() {
  const paletteContainer = document.getElementById("palette-container");
  const generateBtn = document.getElementById("generate-palette-btn");
  const copyFeedback = document.getElementById("copy-feedback");
  if (!generateBtn) return;

  function generatePalette() {
    if (!paletteContainer) return;
    paletteContainer.innerHTML = "";
    for (let i = 0; i < 5; i++) {
      const color =
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0");
      const swatch = document.createElement("div");
      swatch.className = "color-swatch";
      swatch.style.backgroundColor = color;

      const hexCodeSpan = document.createElement("span");
      hexCodeSpan.className = "hex-code";
      hexCodeSpan.textContent = color.toUpperCase();
      swatch.appendChild(hexCodeSpan);

      swatch.addEventListener("click", () => {
        navigator.clipboard.writeText(color).then(() => {
          copyFeedback.textContent = `Warna ${color.toUpperCase()} disalin!`;
          setTimeout(() => {
            copyFeedback.textContent = "";
          }, 2000);
        });
      });
      paletteContainer.appendChild(swatch);
    }
  }

  generateBtn.addEventListener("click", () => {
    generatePalette();
    paletteGenerationCount++;
    localStorage.setItem("paletteCount", paletteGenerationCount);
    if (paletteGenerationCount >= 5) unlockAchievement("palette_picasso");
  });

  generatePalette(); // Initial generation
}

// --- "Behind the Code" Logic ---
function initializeCodeViewers() {
  const codeToggleButtons = document.querySelectorAll(".btn-code-toggle");
  codeToggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const sourceId = button.dataset.codeSource;
      const sourceElement = document.getElementById(sourceId);
      const viewerElement = button.nextElementSibling;

      if (sourceElement && viewerElement) {
        const isOpen = viewerElement.classList.toggle("open");
        if (isOpen) {
          if (viewerElement.innerHTML.trim() === "") {
            viewerElement.innerHTML = sourceElement.innerHTML;
            Prism.highlightAllUnder(viewerElement);
          }
          button.textContent = "Sembunyikan Kode";
          unlockAchievement("code_inspector");
        } else {
          button.textContent = "Lihat Kode";
        }
      }
    });
  });
}
