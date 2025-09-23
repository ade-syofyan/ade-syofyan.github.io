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
// --- Live Demo: Pathfinding Visualizer ---
function initializePathfindingVisualizer() {
  const gridContainer = document.getElementById("pathfinding-grid");
  const controlsContainer = document.getElementById("pathfinding-controls");
  const runBtn = document.getElementById("run-pathfinding-btn");
  const resetBtn = document.getElementById("reset-pathfinding-btn");

  if (!gridContainer || !runBtn || !resetBtn) return;

  const GRID_WIDTH = 20;
  const GRID_HEIGHT = 10;
  let nodes = [];
  let startNode = null;
  let endNode = null;
  let currentMode = "start"; // 'start', 'end', 'wall'
  let isRunning = false;

  function createGrid() {
    gridContainer.innerHTML = "";
    nodes = [];
    for (let row = 0; row < GRID_HEIGHT; row++) {
      const currentRow = [];
      for (let col = 0; col < GRID_WIDTH; col++) {
        const node = document.createElement("div");
        node.className = "pathfinding-node";
        node.dataset.row = row;
        node.dataset.col = col;
        node.addEventListener("click", () => handleNodeClick(row, col));
        gridContainer.appendChild(node);
        currentRow.push({
          element: node,
          isWall: false,
          isStart: false,
          isEnd: false,
        });
      }
      nodes.push(currentRow);
    }
  }

  function handleNodeClick(row, col) {
    if (isRunning) return;
    const node = nodes[row][col];

    if (currentMode === "start") {
      if (startNode) {
        startNode.isStart = false;
        startNode.element.classList.remove("node-start");
      }
      node.isStart = true;
      node.element.classList.add("node-start");
      startNode = node;
    } else if (currentMode === "end") {
      if (endNode) {
        endNode.isEnd = false;
        endNode.element.classList.remove("node-end");
      }
      node.isEnd = true;
      node.element.classList.add("node-end");
      endNode = node;
    } else if (currentMode === "wall") {
      if (!node.isStart && !node.isEnd) {
        node.isWall = !node.isWall;
        node.element.classList.toggle("node-wall", node.isWall);
      }
    }
  }

  function resetGrid(fullReset = true) {
    isRunning = false;
    for (let row = 0; row < GRID_HEIGHT; row++) {
      for (let col = 0; col < GRID_WIDTH; col++) {
        const node = nodes[row][col];
        node.element.classList.remove("node-visited", "node-path");
        if (fullReset) {
          node.element.classList.remove("node-start", "node-end", "node-wall");
          node.isStart = false;
          node.isEnd = false;
          node.isWall = false;
        }
      }
    }
    if (fullReset) {
      startNode = null;
      endNode = null;
    }
  }

  async function runBFS() {
    if (!startNode || !endNode || isRunning) return;
    isRunning = true;
    resetGrid(false);
    unlockAchievement("navigator");

    const queue = [
      [
        parseInt(startNode.element.dataset.row),
        parseInt(startNode.element.dataset.col),
      ],
    ];
    const visited = new Set([
      `${startNode.element.dataset.row}-${startNode.element.dataset.col}`,
    ]);
    const predecessors = new Map();

    const directions = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];

    let pathFound = false;
    while (queue.length > 0) {
      const [row, col] = queue.shift();

      if (
        row === parseInt(endNode.element.dataset.row) &&
        col === parseInt(endNode.element.dataset.col)
      ) {
        pathFound = true;
        break;
      }

      if (!nodes[row][col].isStart) {
        nodes[row][col].element.classList.add("node-visited");
        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;

        if (
          newRow >= 0 &&
          newRow < GRID_HEIGHT &&
          newCol >= 0 &&
          newCol < GRID_WIDTH &&
          !nodes[newRow][newCol].isWall &&
          !visited.has(`${newRow}-${newCol}`)
        ) {
          visited.add(`${newRow}-${newCol}`);
          predecessors.set(`${newRow}-${newCol}`, `${row}-${col}`);
          queue.push([newRow, newCol]);
        }
      }
    }

    if (pathFound) {
      let current = `${endNode.element.dataset.row}-${endNode.element.dataset.col}`;
      while (
        current &&
        current !==
          `${startNode.element.dataset.row}-${startNode.element.dataset.col}`
      ) {
        const [row, col] = current.split("-").map(Number);
        if (!nodes[row][col].isEnd) {
          nodes[row][col].element.classList.add("node-path");
          await new Promise((resolve) => setTimeout(resolve, 30));
        }
        current = predecessors.get(current);
      }
    }
    isRunning = false;
  }

  controlsContainer.querySelectorAll(".pathfinding-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      controlsContainer.querySelector(".active").classList.remove("active");
      btn.classList.add("active");
      currentMode = btn.dataset.mode;
    });
  });

  runBtn.addEventListener("click", runBFS);
  resetBtn.addEventListener("click", () => resetGrid(true));

  createGrid();
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

// --- Time Traveler Achievement ---
function initializeTimeTravelerAchievement() {
  const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
  let timeIsUp = false;

  // Jangan jalankan jika achievement sudah terbuka
  const savedAchievements = JSON.parse(
    localStorage.getItem("portfolioAchievements") || "[]"
  );
  if (savedAchievements.includes("time_traveler")) {
    return;
  }

  const timerId = setTimeout(() => {
    timeIsUp = true;
  }, FIFTEEN_MINUTES_MS);

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible" && timeIsUp) {
      const isNewlyUnlocked = window.unlockAchievement("time_traveler");
      if (isNewlyUnlocked) {
        clearTimeout(timerId);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      }
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
}

// --- CSS Hacker Achievement ---
function initializeCssHackerAchievement() {
  const SECRET_CLASS = "hackerman-mode";

  // Don't run if the achievement is already unlocked
  const savedAchievements = JSON.parse(
    localStorage.getItem("portfolioAchievements") || "[]"
  );
  if (savedAchievements.includes("css_hacker")) {
    return;
  }

  const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        const targetElement = mutation.target;
        if (targetElement.classList.contains(SECRET_CLASS)) {
          console.log(
            "%c[CLASSIFIED] Access Granted. Welcome, fellow developer.",
            "color: #00ff00; font-size: 1.2em; font-family: monospace;"
          );
          const isNewlyUnlocked = window.unlockAchievement("css_hacker");
          if (isNewlyUnlocked) {
            observer.disconnect(); // Stop observing once unlocked
          }
        }
      }
    }
  });

  observer.observe(document.body, { attributes: true });
}
