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
  const modal = document.getElementById("codeViewerModal");
  const modalHeader = document.getElementById("codeViewerHeader");
  const modalContent = document.getElementById("codeViewerContent");
  const codeToggleButtons = document.querySelectorAll(".btn-code-toggle");

  if (!modal || !modalHeader || !modalContent || codeToggleButtons.length === 0)
    return;

  const closeModal = () => {
    modal.classList.remove("open");
    document.body.classList.remove("modal-open");
    // Membersihkan konten untuk penggunaan berikutnya
    modalHeader.innerHTML = "";
    modalContent.innerHTML = "";
  };

  const openModal = (sourceId) => {
    const sourcePreElement = document.querySelector(`#${sourceId} pre`);
    const sourceCodeElement = sourcePreElement
      ? sourcePreElement.querySelector("code")
      : null;
    if (!sourceCodeElement) return;

    // --- Dedent Logic ---
    // Menghapus spasi di awal yang disebabkan oleh indentasi HTML.
    const rawCode = sourceCodeElement.textContent;
    const lines = rawCode.split("\n");
    // Temukan indentasi terkecil dari baris yang tidak kosong.
    const minIndent = Math.min(
      ...lines
        .filter((line) => line.trim())
        .map((line) => line.match(/^\s*/)[0].length)
    );
    // Hapus indentasi tersebut dari setiap baris dan rapikan.
    const dedentedCode = lines
      .map((line) => line.substring(minIndent))
      .join("\n")
      .trim();

    // 1. Buat Header Modal
    const language =
      sourceCodeElement.className.replace("language-", "") || "code";
    const codeToCopy = dedentedCode;

    const copyButton = document.createElement("button");
    copyButton.className = "btn-copy-code";
    copyButton.innerHTML =
      '<i data-lucide="copy" class="w-4 h-4 mr-2"></i>Salin';
    copyButton.onclick = () => {
      navigator.clipboard.writeText(codeToCopy).then(() => {
        copyButton.innerHTML =
          '<i data-lucide="check" class="w-4 h-4 mr-2"></i>Disalin!';
        lucide.createIcons();
        setTimeout(() => {
          copyButton.innerHTML =
            '<i data-lucide="copy" class="w-4 h-4 mr-2"></i>Salin';
          lucide.createIcons();
        }, 2000);
      });
    };

    const closeButton = document.createElement("button");
    closeButton.className = "modal-close-btn static text-2xl ml-4 p-0";
    closeButton.innerHTML = "&times;";
    closeButton.onclick = closeModal;

    modalHeader.className = "code-viewer-header";
    modalHeader.innerHTML = `<span class="code-language">${language}</span>`;
    const controlsDiv = document.createElement("div");
    controlsDiv.append(copyButton, closeButton);
    modalHeader.appendChild(controlsDiv);

    // 2. Kloning dan tampilkan konten kode
    const codeClone = sourcePreElement.cloneNode(true);
    codeClone.querySelector("code").textContent = dedentedCode; // Ganti dengan kode yang sudah rapi
    codeClone.classList.add("line-numbers"); // Tambahkan nomor baris
    modalContent.appendChild(codeClone);

    // 3. Highlight syntax dan tampilkan modal
    Prism.highlightAllUnder(modalContent);
    lucide.createIcons();
    modal.classList.add("open");
    document.body.classList.add("modal-open");
    unlockAchievement("code_inspector");
  };

  codeToggleButtons.forEach((button) => {
    button.addEventListener("click", () =>
      openModal(button.dataset.codeSource)
    );
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}
