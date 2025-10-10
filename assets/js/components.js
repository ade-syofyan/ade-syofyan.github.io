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

class PriorityQueue {
  constructor() {
    this.elements = [];
  }
  enqueue(element, priority) {
    this.elements.push({ element, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }
  dequeue() {
    return this.elements.shift().element;
  }
  isEmpty() {
    return this.elements.length === 0;
  }
}

function heuristic(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

// --- Live Demo: Pathfinding Visualizer ---
function initializePathfindingVisualizer() {
  // 1. SETUP: Get all necessary DOM elements
  const gridContainer = document.getElementById("pathfinding-grid");
  const controlsContainer = document.getElementById("pathfinding-controls");
  const runBtn = document.getElementById("run-pathfinding-btn");
  const resetBtn = document.getElementById("reset-pathfinding-btn");
  const algorithmSelect = document.getElementById("algorithm-select");

  // Exit if any element is missing to prevent errors
  if (!gridContainer || !controlsContainer || !runBtn || !resetBtn) {
    return;
  }

  // 2. STATE & CONFIGURATION
  const GRID_WIDTH = 30;
  const GRID_HEIGHT = 15;
  let nodes = [];
  let startNode = null;
  let endNode = null;
  let currentMode = "start"; // Modes: 'start', 'end', 'wall'
  let isRunning = false;
  let isMouseDown = false;

  // 3. CORE LOGIC

  /**
   * Creates the grid of nodes.
   */
  function createGrid() {
    gridContainer.innerHTML = "";
    nodes = [];
    for (let row = 0; row < GRID_HEIGHT; row++) {
      const currentRow = [];
      for (let col = 0; col < GRID_WIDTH; col++) {
        const nodeEl = document.createElement("div");
        nodeEl.className = "pathfinding-node";
        nodeEl.id = `node-${row}-${col}`;
        const costEl = document.createElement("span");
        costEl.className = "node-cost";
        nodeEl.appendChild(costEl);
        gridContainer.appendChild(nodeEl);
        currentRow.push({
          element: nodeEl,
          costElement: costEl,
          row,
          col,
          isWall: false,
          isStart: false,
          isEnd: false,
          isWater: false,
        });
      }
      nodes.push(currentRow);
    }
  }

  /**
   * Handles all user interactions with the grid nodes (click or drag).
   * @param {HTMLElement} target - The grid node element that was interacted with.
   */
  function handleInteraction(target) {
    if (isRunning || !target.id || !target.id.startsWith("node-")) return;

    const [_, row, col] = target.id.split("-").map(Number);
    const node = nodes[row][col];

    if (currentMode === "wall") {
      if (!node.isStart && !node.isEnd && !node.isWater) {
        node.isWall = !node.isWall;
        node.element.classList.toggle("node-wall", node.isWall);
      }
    } else if (currentMode === "water") {
      if (!node.isStart && !node.isEnd && !node.isWall) {
        node.isWater = !node.isWater;
        node.element.classList.toggle("node-water", node.isWater);
      }
    } else {
      if (node.isWater) {
        node.isWater = false;
        node.element.classList.remove("node-water");
      }
      if (node.isWall) {
        node.isWall = false;
        node.element.classList.remove("node-wall");
      }

      if (currentMode === "start") {
        if (node.isEnd) return;
        if (startNode) {
          startNode.isStart = false;
          startNode.element.classList.remove("node-start");
        }
        node.isStart = true;
        node.element.classList.add("node-start");
        startNode = node;
      } else if (currentMode === "end") {
        if (node.isStart) return;
        if (endNode) {
          endNode.isEnd = false;
          endNode.element.classList.remove("node-end");
        }
        node.isEnd = true;
        node.element.classList.add("node-end");
        endNode = node;
      }
    }
  }

  /**
   * Resets the grid to its initial state or just clears the path visualization.
   * @param {boolean} fullReset - If true, clears walls, start, and end points.
   */
  function resetGrid(fullReset = true) {
    isRunning = false;
    runBtn.disabled = false;
    resetBtn.disabled = false;
    controlsContainer
      .querySelectorAll(".pathfinding-btn")
      .forEach((btn) => (btn.disabled = false));
    algorithmSelect.disabled = false;

    gridContainer.classList.remove("shake-animation");
    for (let row = 0; row < GRID_HEIGHT; row++) {
      for (let col = 0; col < GRID_WIDTH; col++) {
        const node = nodes[row][col];
        node.element.classList.remove("node-visited", "node-path");
        node.element.classList.remove("is-drawing");
        node.costElement.textContent = "";
        if (fullReset) {
          node.element.classList.remove(
            "node-start",
            "node-end",
            "node-wall",
            "node-water"
          );
          node.isStart = false;
          node.isEnd = false;
          node.isWall = false;
          node.isWater = false;
        }
      }
    }
    if (fullReset) {
      startNode = null;
      endNode = null;
    }
  }

  /**
   * Runs the Breadth-First Search (BFS) algorithm to find the shortest path.
   */
  async function runSelectedAlgorithm() {
    if (!startNode || !endNode || isRunning) return;
    isRunning = true;
    runBtn.disabled = true;
    resetBtn.disabled = true;
    controlsContainer
      .querySelectorAll(".pathfinding-btn")
      .forEach((btn) => (btn.disabled = true));
    algorithmSelect.disabled = true;

    resetGrid(false);
    unlockAchievement("navigator");

    const predecessors = new Map();
    let pathFound = false;
    const algorithm = algorithmSelect.value;
    const directions = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];

    if (algorithm === "bfs") {
      const queue = [startNode];
      const visited = new Set([startNode]);
      while (queue.length > 0) {
        const current = queue.shift();
        if (current === endNode) {
          pathFound = true;
          break;
        }
        if (!current.isStart) {
          current.element.classList.add("node-visited");
          await new Promise((r) => setTimeout(r, 20));
        }
        for (const [dr, dc] of directions) {
          const newRow = current.row + dr,
            newCol = current.col + dc;
          if (
            newRow >= 0 &&
            newRow < GRID_HEIGHT &&
            newCol >= 0 &&
            newCol < GRID_WIDTH
          ) {
            const neighbor = nodes[newRow][newCol];
            if (!neighbor.isWall && !visited.has(neighbor)) {
              visited.add(neighbor);
              predecessors.set(neighbor, current);
              queue.push(neighbor);
            }
          }
        }
      }
    } else {
      // Dijkstra and A*
      const distances = new Map();
      const pq = new PriorityQueue();
      for (const row of nodes)
        for (const node of row) distances.set(node, Infinity);

      distances.set(startNode, 0);
      pq.enqueue(startNode, 0);

      while (!pq.isEmpty()) {
        const current = pq.dequeue();
        if (current === endNode) {
          pathFound = true;
          break;
        }
        if (distances.get(current) === Infinity) continue;

        if (!current.isStart) {
          current.element.classList.add("node-visited");
          current.costElement.textContent = distances.get(current);
          await new Promise((r) => setTimeout(r, 20));
        }

        for (const [dr, dc] of directions) {
          const newRow = current.row + dr,
            newCol = current.col + dc;
          if (
            newRow >= 0 &&
            newRow < GRID_HEIGHT &&
            newCol >= 0 &&
            newCol < GRID_WIDTH
          ) {
            const neighbor = nodes[newRow][newCol];
            if (neighbor.isWall) continue;

            const weight = neighbor.isWater ? 15 : 1;
            const distanceToNeighbor = distances.get(current) + weight;

            if (distanceToNeighbor < distances.get(neighbor)) {
              distances.set(neighbor, distanceToNeighbor);
              predecessors.set(neighbor, current);
              let priority = distanceToNeighbor;
              if (algorithm === "a-star") {
                priority += heuristic(neighbor, endNode);
              }
              pq.enqueue(neighbor, priority);
            }
          }
        }
      }
    }

    if (pathFound) {
      let current = endNode;
      while (current && current !== startNode) {
        if (!current.isEnd) {
          current.element.classList.add("is-drawing");
          await new Promise((resolve) => setTimeout(resolve, 35));
          current.element.classList.remove("is-drawing");
          current.element.classList.add("node-path");
        } else {
          await new Promise((resolve) => setTimeout(resolve, 35));
        }
        current = predecessors.get(current);
      }
    } else {
      gridContainer.classList.add("shake-animation");
    }
    isRunning = false;
    runBtn.disabled = false;
    resetBtn.disabled = false;
    controlsContainer
      .querySelectorAll(".pathfinding-btn")
      .forEach((btn) => (btn.disabled = false));
    algorithmSelect.disabled = false;
  }

  // 4. EVENT LISTENERS
  gridContainer.addEventListener("mousedown", (e) => {
    isMouseDown = true;
    handleInteraction(e.target);
  });
  gridContainer.addEventListener("mouseover", (e) => {
    if (isMouseDown && (currentMode === "wall" || currentMode === "water")) {
      handleInteraction(e.target);
    }
  });
  document.addEventListener("mouseup", () => {
    isMouseDown = false;
  });

  controlsContainer.querySelectorAll(".pathfinding-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      controlsContainer.querySelector(".active").classList.remove("active");
      btn.classList.add("active");
      currentMode = btn.dataset.mode;
    });
  });

  runBtn.addEventListener("click", runSelectedAlgorithm);
  resetBtn.addEventListener("click", () => resetGrid(true));

  // 5. INITIALIZATION
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
          // Menggunakan Swal Toast untuk feedback
          const Toast = Swal.mixin({
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
          });
          Toast.fire({
            icon: "success",
            title: `Warna ${color.toUpperCase()} disalin!`,
          });
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

// --- Live Demo: Certificate Generator ---
function initializeCertificateGenerator() {
  const modal = document.getElementById("certificateModal");
  const generateBtn = document.getElementById("generate-certificate-btn");
  const nameInput = document.getElementById("certificate-name-input");
  const recipientNameEl = document.getElementById("cert-recipient-name");
  const dateEl = document.getElementById("certificate-date");
  const downloadBtn = document.getElementById("download-certificate-btn");
  const credentialIdEl = document.getElementById("cert-credential-id");
  const sourceUrlEl = document.getElementById("cert-source-url");

  // Hanya inisialisasi jika tombol generate ada.
  // Ini penting karena elemennya sekarang dibuat dinamis.
  if (!generateBtn) return;

  // Hapus event listener lama untuk mencegah duplikasi jika fungsi ini dipanggil lagi
  generateBtn.replaceWith(generateBtn.cloneNode(true));

  /**
   * Fungsi untuk mengisi data ke dalam elemen sertifikat.
   * @param {string} name - Nama penerima sertifikat.
   */
  function populateCertificateData(name) {
    recipientNameEl.textContent = name;
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    if (credentialIdEl) {
      const credentialId = `AS-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`;
      credentialIdEl.textContent = credentialId;
    }
    if (sourceUrlEl) {
      const sourceUrl = window.location.origin + window.location.pathname;
      sourceUrlEl.href = sourceUrl;
      sourceUrlEl.textContent = sourceUrl.replace(
        /^(https?:\/\/)?(www\.)?/,
        ""
      );
    }
  }

  /**
   * Fungsi untuk mengambil elemen sertifikat, mengubahnya menjadi gambar, dan mengunduhnya.
   * @param {string} name - Nama yang akan digunakan untuk nama file.
   */
  async function downloadCertificateImage(name) {
    const certWrapper = document.getElementById("certificate-wrapper");
    const loadingOverlay = document.getElementById("certificateLoadingOverlay");
    const originalParent = certWrapper.parentNode;

    // Tampilkan overlay loading
    if (loadingOverlay) {
      loadingOverlay.classList.remove("hidden");
      loadingOverlay.classList.add("flex");
    }

    // Simpan gaya asli untuk dikembalikan nanti
    const originalStyles = {
      width: certWrapper.style.width,
      height: certWrapper.style.height,
      maxHeight: certWrapper.style.maxHeight,
      overflow: certWrapper.style.overflow,
    };

    // Pindahkan elemen ke body dan paksa layout lanskap untuk rendering
    document.body.appendChild(certWrapper);
    certWrapper.style.width = "1200px";
    certWrapper.style.height = "auto";
    certWrapper.style.overflow = "hidden";

    const computedBgColor = getComputedStyle(certWrapper).backgroundColor;
    const borderRadius = parseFloat(getComputedStyle(certWrapper).borderRadius);

    const images = Array.from(certWrapper.querySelectorAll("img"));
    const imageLoadPromises = images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) resolve();
          else img.onload = resolve;
        })
    );
    await Promise.all(imageLoadPromises);

    const signatureImg = certWrapper.querySelector(
      ".certificate-signature-img"
    );
    if (signatureImg) signatureImg.style.filter = "none";

    try {
      const canvas = await html2canvas(certWrapper, {
        backgroundColor: computedBgColor,
        useCORS: true,
        width: certWrapper.scrollWidth,
        height: certWrapper.scrollHeight,
        windowWidth: certWrapper.scrollWidth,
        windowHeight: certWrapper.scrollHeight,
      });

      const roundedCanvas = document.createElement("canvas");
      roundedCanvas.width = canvas.width;
      roundedCanvas.height = canvas.height;
      const context = roundedCanvas.getContext("2d");

      context.beginPath();
      context.moveTo(borderRadius, 0);
      context.lineTo(roundedCanvas.width - borderRadius, 0);
      context.arcTo(
        roundedCanvas.width,
        0,
        roundedCanvas.width,
        borderRadius,
        borderRadius
      );
      context.lineTo(roundedCanvas.width, roundedCanvas.height - borderRadius);
      context.arcTo(
        roundedCanvas.width,
        roundedCanvas.height,
        roundedCanvas.width - borderRadius,
        roundedCanvas.height,
        borderRadius
      );
      context.lineTo(borderRadius, roundedCanvas.height);
      context.arcTo(
        0,
        roundedCanvas.height,
        0,
        roundedCanvas.height - borderRadius,
        borderRadius
      );
      context.lineTo(0, borderRadius);
      context.arcTo(0, 0, borderRadius, 0, borderRadius);
      context.closePath();
      context.clip();
      context.drawImage(canvas, 0, 0);

      const timestamp = Date.now();
      const safeName = name.trim().toLowerCase().replace(/\s+/g, "-");

      const link = document.createElement("a");
      link.download = `sertifikat-apresiasi-${safeName}-${timestamp}.png`;
      link.href = roundedCanvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Gagal membuat gambar sertifikat:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Mengunduh",
        text: "Maaf, terjadi kesalahan saat mencoba membuat gambar sertifikat. Silakan coba lagi.",
      });
    } finally {
      if (signatureImg) signatureImg.style.filter = "";
      originalParent.appendChild(certWrapper);
      Object.assign(certWrapper.style, originalStyles);
      if (loadingOverlay) {
        loadingOverlay.classList.add("hidden");
        loadingOverlay.classList.remove("flex");
      }
    }
  }

  const generate = () => {
    const originalName = nameInput.value.trim();
    if (!originalName) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Silakan masukkan nama Anda terlebih dahulu.",
      });
      nameInput.focus();
      return;
    }

    // Mengubah nama menjadi format Title Case (setiap kata diawali huruf kapital)
    const formattedName = originalName
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // Tampilkan dialog konfirmasi sebelum melanjutkan
    Swal.fire({
      title: "Konfirmasi Pembuatan Sertifikat",
      html: `
        <div class="text-left space-y-3 p-4" style="color: var(--text-secondary);">
          <p>Sertifikat ini hanya dapat dibuat <strong>satu kali</strong>.</p>
          <p>Setelah dibuat, semua pencapaian Anda akan <strong>direset</strong>.</p>
          <p class="mt-4 pt-4 border-t" style="border-color: var(--border-color);">Pastikan nama yang tercantum sudah benar:</p>
          <p class="text-center text-xl font-bold text-accent">${formattedName}</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Buat & Reset",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        if (window.resetAchievements) {
          window.resetAchievements();
        }

        populateCertificateData(formattedName);

        // Tutup modal pencapaian terlebih dahulu
        if (window.closeAchievementModal) {
          window.closeAchievementModal();
        }

        if (DEBUG_CERTIFICATE) {
          // Alur DEBUG: Tampilkan modal dulu
          setTimeout(() => {
            modal.classList.add("open");
            lockBodyScroll();
            const certCanvas = modal.querySelector(".certificate-plexus-bg");
            if (certCanvas && typeof createPlexusInstance === "function") {
              setTimeout(() => {
                createPlexusInstance(certCanvas, {
                  particleCount: 40,
                  maxDistance: 100,
                });
              }, 100);
            }
          }, 300);
        } else {
          // Alur PRODUKSI: Langsung download
          setTimeout(() => {
            downloadCertificateImage(formattedName);
          }, 300);
        }
      }
    });
  };

  // Ambil referensi elemen baru setelah di-clone
  const newGenerateBtn = document.getElementById("generate-certificate-btn");
  const newNameInput = document.getElementById("certificate-name-input");

  if (downloadBtn) {
    downloadBtn.addEventListener("click", async () => {
      const downloadIcon = downloadBtn.querySelector(
        '[data-lucide="download"]'
      );
      const loadingIcon = downloadBtn.querySelector('[data-lucide="loader"]');

      downloadBtn.disabled = true;
      if (downloadIcon && loadingIcon) {
        downloadIcon.classList.add("hidden");
        loadingIcon.classList.remove("hidden");
      }

      // Sembunyikan modal saat proses download dimulai
      if (modal) modal.style.display = "none";

      try {
        // Karena tombol ini hanya ada di mode DEBUG, kita panggil fungsi download
        // dengan nama yang sudah ada di input.
        // Fungsi ini akan menangani overlay loading dan proses konversi gambar.
        const currentName =
          newNameInput.value ||
          document.getElementById("cert-recipient-name").textContent ||
          "sertifikat";
        await downloadCertificateImage(currentName);
      } finally {
        downloadBtn.disabled = false;
        if (downloadIcon && loadingIcon) {
          downloadIcon.classList.remove("hidden");
          loadingIcon.classList.add("hidden");
        }
        // Tampilkan kembali modal setelah selesai
        if (modal) modal.style.display = "flex";
      }
    });
  }

  newGenerateBtn.addEventListener("click", generate);
  newNameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") generate();
  });

  window.closeCertificateModal = function () {
    modal.classList.remove("open");
    unlockBodyScroll();
  };

  modal.addEventListener("click", (e) => {
    if (e.target === modal) window.closeCertificateModal();
  });
}

// --- "Behind the Code" Logic ---
function initializeCodeViewers() {
  const modal = document.getElementById("codeViewerModal");
  const modalHeader = document.getElementById("codeViewerHeader");
  const modalContent = document.getElementById("codeViewerContent");
  const codeToggleButtons = document.querySelectorAll(".btn-code-toggle");
  if (!modal || !modalHeader || !modalContent || codeToggleButtons.length === 0)
    return;

  let relayout = null;

  const closeModal = () => {
    if (relayout) {
      window.removeEventListener("resize", relayout);
      relayout = null;
    }
    if (modal._ro) {
      modal._ro.disconnect();
      modal._ro = null;
    }
    modal.classList.remove("open");
    unlockBodyScroll();
    modalHeader.innerHTML = "";
    modalContent.innerHTML = "";
  };

  const openModal = (sourceId) => {
    const sourceContainer = document.getElementById(sourceId);
    const sourcePreElements =
      sourceContainer.querySelectorAll("pre[data-lang]");
    if (sourcePreElements.length === 0) return;

    // (optional) filter untuk pathfinder
    let selectedAlgorithm = null;
    if (sourceId === "pathfinding-visualizer-code") {
      const algorithmSelect = document.getElementById("algorithm-select");
      if (algorithmSelect) selectedAlgorithm = algorithmSelect.value;
    }

    // reset isi modal
    modalHeader.innerHTML = "";
    modalContent.innerHTML = "";

    // header tabs + tombol close
    const tabContainer = document.createElement("div");
    tabContainer.className = "code-viewer-tabs";
    const closeButton = document.createElement("button");
    closeButton.className = "modal-close-btn";
    closeButton.setAttribute("aria-label", "Close Code Viewer");
    closeButton.innerHTML = '<i data-lucide="x" class="w-6 h-6"></i>';
    closeButton.onclick = closeModal;
    modalHeader.append(tabContainer, closeButton);

    // buat pane kode
    sourcePreElements.forEach((preEl) => {
      const lang = preEl.dataset.lang;
      const algo = preEl.dataset.algo;
      const codeEl = preEl.querySelector("code");
      if (!codeEl) return;
      if (
        lang === "js" &&
        selectedAlgorithm &&
        algo &&
        algo !== selectedAlgorithm
      )
        return;

      const lines = codeEl.textContent.split("\n");
      const minIndent = Math.min(
        ...lines.filter((l) => l.trim()).map((l) => l.match(/^\s*/)[0].length)
      );
      const dedentedCode = lines
        .map((l) => l.substring(minIndent))
        .join("\n")
        .trim();

      const tabButton = document.createElement("button");
      tabButton.className = "code-viewer-tab";
      tabButton.textContent = lang.toUpperCase();
      tabContainer.appendChild(tabButton);

      const codeBlockWrapper = document.createElement("div");
      codeBlockWrapper.id = `code-block-${lang}`;
      codeBlockWrapper.className = "code-block-wrapper hidden";
      const newPre = document.createElement("pre");
      newPre.className = `language-${lang} line-numbers`;
      const newCode = document.createElement("code");
      newCode.textContent = dedentedCode;
      newPre.appendChild(newCode);
      codeBlockWrapper.appendChild(newPre);
      modalContent.appendChild(codeBlockWrapper);

      tabButton.addEventListener("click", () => {
        if (tabButton.classList.contains("active")) return;
        tabContainer.querySelector(".active")?.classList.remove("active");
        tabButton.classList.add("active");
        modalContent
          .querySelector(".code-block-wrapper:not(.hidden)")
          ?.classList.add("hidden");
        codeBlockWrapper.classList.remove("hidden");
        padLineNumbersIn(codeBlockWrapper);
      });

      // buka tab pertama
      if (!tabContainer.querySelector(".active")) {
        tabButton.classList.add("active");
        codeBlockWrapper.classList.remove("hidden");
      }
    });

    // tombol salin
    const copyButton = document.createElement("button");
    copyButton.className = "btn-copy-code";
    copyButton.innerHTML =
      '<i data-lucide="copy" class="w-3 h-3 mr-2"></i>Salin';
    copyButton.onclick = () => {
      const activeCodeBlock = modalContent.querySelector(
        ".code-block-wrapper:not(.hidden) code"
      );
      if (activeCodeBlock) {
        navigator.clipboard.writeText(activeCodeBlock.textContent).then(() => {
          copyButton.innerHTML =
            '<i data-lucide="check" class="w-4 h-4 mr-2"></i>Disalin!';
          lucide.createIcons();
          setTimeout(() => {
            copyButton.innerHTML =
              '<i data-lucide="copy" class="w-4 h-4 mr-2"></i>Salin';
            lucide.createIcons();
          }, 2000);
        });
      }
    };
    modalContent.appendChild(copyButton);

    // tampilkan modal + highlight
    Prism.highlightAllUnder(modalContent);
    lucide.createIcons();
    modal.classList.add("open");
    lockBodyScroll();

    Prism.hooks.add("complete", () => {
      if (modal.classList.contains("open")) {
        padLineNumbersIn(modalContent);
      }
    });

    // --- relayout yang kuat ---
    relayout = () => padLineNumbersIn(modalContent);
    window.addEventListener("resize", relayout);

    // observe perubahan ukuran konten
    const ro = new ResizeObserver(() => relayout && relayout());
    ro.observe(modalContent);
    modal._ro = ro;

    // setelah layout settle + font siap
    requestAnimationFrame(() =>
      requestAnimationFrame(() => relayout && relayout())
    );
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => relayout && relayout());
    }
  };

  // === Pad gutter line-numbers sampai DASAR body modal + hilangkan gap awal
  function padLineNumbersIn(root) {
    const blocks = root.querySelectorAll("pre.line-numbers");
    const body = document.getElementById("codeViewerContent");
    if (!body) return;

    const bodyRect = body.getBoundingClientRect();

    blocks.forEach((pre) => {
      const rows = pre.querySelector(".line-numbers-rows");
      if (!rows) return;

      const preRect = pre.getBoundingClientRect();
      const preStyle = getComputedStyle(pre);
      const padTop = parseFloat(preStyle.paddingTop) || 0;

      // target: dari top <pre> (setelah padding-top) hingga bottom body modal
      const targetHeight = Math.max(
        0,
        Math.floor(bodyRect.bottom - preRect.top - padTop)
      );

      // line-height akurat (fallback jika 'normal')
      const code = pre.querySelector("code") || pre;
      let lh = parseFloat(getComputedStyle(code).lineHeight);
      if (!lh || Number.isNaN(lh)) {
        const probe = document.createElement("span");
        probe.textContent = "M";
        probe.style.visibility = "hidden";
        code.appendChild(probe);
        lh = probe.getBoundingClientRect().height || 16;
        probe.remove();
      }

      const realCount = rows.querySelectorAll(
        ":scope > span:not(.filler)"
      ).length;
      const shouldHaveTotal = Math.max(realCount, Math.ceil(targetHeight / lh));
      const currentTotal = rows.childElementCount;

      if (currentTotal < shouldHaveTotal) {
        const frag = document.createDocumentFragment();
        for (let i = currentTotal; i < shouldHaveTotal - 1; i++) {
          const s = document.createElement("span");
          if (i >= realCount) s.className = "filler"; // baris tambahan
          frag.appendChild(s);
        }
        rows.appendChild(frag);
      } else if (currentTotal > shouldHaveTotal) {
        // hapus hanya baris filler dari belakang
        let toRemove = currentTotal - shouldHaveTotal + 1;
        for (let i = rows.children.length - 1; i >= 0 && toRemove > 0; i--) {
          const el = rows.children[i];
          if (el.classList.contains("filler")) {
            rows.removeChild(el);
            toRemove--;
          } else break;
        }
      }
    });
  }

  // bind tombol pembuka
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
            observer.disconnect();
          }
        }
      }
    }
  });

  observer.observe(document.body, { attributes: true });
}
