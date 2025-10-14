// --- Live Demo: CSV to Chart Generator ---
function initializeCsvToChartGenerator() {
  const csvInput = document.getElementById("csv-input");
  const fileInput = document.getElementById("csv-file-input");
  const exampleBtn = document.getElementById("csv-example-btn");
  const clearBtn = document.getElementById("csv-clear-btn");
  const downloadBtn = document.getElementById("csv-download-btn");
  const chartContainer = document.getElementById("chart-output-container");
  const canvas = document.getElementById("csv-chart-canvas");
  const placeholder = document.getElementById("chart-placeholder");
  const controls = document.getElementById("chart-controls");
  const chartTypeSelect = document.getElementById("chart-type-select");
  const colorSchemeSelect = document.getElementById("chart-color-select");
  const codeSourceEl = document.getElementById("csv-chart-code");

  if (!csvInput || !canvas) return;

  let chartInstance = null;
  let parsedData = null;

  const exampleCSV = `Bulan,Penjualan,Pengeluaran
Januari,150,80
Februari,200,120
Maret,180,100
April,270,150
Mei,210,130
Juni,300,170`;

  // Palet warna yang menarik
  const colorSchemes = {
    default: [
      "rgba(99, 179, 237, 0.7)", "rgba(99, 179, 237, 0.5)", "rgba(99, 179, 237, 0.3)"
    ],
    viridis: ['#440154', '#414487', '#2A788E', '#22A884', '#7AD151', '#FDE725'],
    spectral: ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
    pastel: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a']
  };

  // Populate the code block for the "View Code" button
  if (codeSourceEl) {
    codeSourceEl.innerHTML = `
      <pre data-lang="html" class="language-html"><code>&lt;textarea id="csv-input"&gt;&lt;/textarea&gt;
&lt;input type="file" id="csv-file-input"&gt;
&lt;canvas id="csv-chart-canvas"&gt;&lt;/canvas&gt;</code></pre>
      <pre data-lang="js" class="language-javascript"><code>// Menggunakan Chart.js (https://www.chartjs.org/)
function parseCSV(csvText) {
  const lines = csvText.trim().split('\\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = lines.slice(1).map(line => {
    const values = line.split(',');
    let entry = {};
    headers.forEach((header, i) => {
      entry[header] = isNaN(values[i]) ? values[i].trim() : Number(values[i]);
    });
    return entry;
  });
  return { headers, data };
}

function createChart(data) {
  const ctx = document.getElementById('csv-chart-canvas').getContext('2d');
  const labels = data.data.map(row => row[data.headers[0]]);
  const values = data.data.map(row => row[data.headers[1]]);

  new Chart(ctx, {
    type: 'bar', // 'line', 'pie', etc.
    data: {
      labels: labels,
      datasets: [{
        label: data.headers[1],
        data: values,
        backgroundColor: 'rgba(99, 179, 237, 0.7)',
        borderColor: 'rgba(99, 179, 237, 1)',
        borderWidth: 1
      }]
    }
  });
}</code></pre>
    `;
  }

  function parseCSV(csvText) {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) return null;

      const headers = lines[0].split(',').map(h => h.trim()).filter(Boolean);
      if (headers.length < 2) return null;

      const data = lines
        .slice(1)
        .filter(line => line.trim() !== '') // Abaikan baris kosong
        .map(line => {
          const values = line.split(',');
          let entry = {};
          headers.forEach((header, i) => {
            const value = values[i] ? values[i].trim() : '';
            entry[header] = !isNaN(parseFloat(value)) && isFinite(value) ? Number(value) : value;
          });
          return entry;
        });

      // Validasi: kolom kedua harus numerik
      if (data.some(row => typeof row[headers[1]] !== 'number')) {
        return null;
      }

      return { headers, data };
    } catch (e) {
      console.error("CSV Parsing error:", e);
      return null;
    }
  }

  function renderChart() {
    if (!parsedData) return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    canvas.style.opacity = 0;
    placeholder.classList.add("hidden");
    controls.style.opacity = 1;
    controls.style.pointerEvents = 'auto';

    // Ambil label dari kolom pertama
    const labels = parsedData.data.map(row => row[parsedData.headers[0]]);
    const chartType = chartTypeSelect.value;
    const selectedScheme = colorSchemeSelect.value;
    const schemeColors = colorSchemes[selectedScheme] || colorSchemes.default;

    // Buat dataset untuk setiap kolom numerik (selain kolom pertama)
    const datasets = parsedData.headers.slice(1).map((header, index) => {
      // Pastikan kolom ini berisi angka
      if (typeof parsedData.data[0][header] !== 'number') return null;

      const data = parsedData.data.map(row => row[header]);
      const colorIndex = index % schemeColors.length;
      const mainColor = schemeColors[colorIndex];
      const borderColor = mainColor.replace('0.7', '1'); // Buat warna border lebih solid

      return {
        label: header,
        data: data,
        backgroundColor: mainColor,
        borderColor: borderColor,
        borderWidth: 1.5,
      };
    }).filter(Boolean); // Hapus dataset yang null (jika ada kolom non-numerik)

    chartInstance = new Chart(canvas, {
      type: chartType,
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            // Tampilkan legenda jika ada lebih dari satu dataset, atau jika tipenya pie/doughnut
            display: datasets.length > 1 || ['pie', 'doughnut', 'polarArea'].includes(chartType),
            position: 'top',
            labels: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(128, 128, 128, 0.2)' },
            ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') }
          },
          x: {
            grid: { display: false },
            ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') }
          }
        }
      }
    });
    
    // Animate chart appearance
    setTimeout(() => {
      canvas.style.transition = 'opacity 0.5s ease-in-out';
      canvas.style.opacity = 1;
    }, 100);
  }

  function processInput(csvText) {
    if (csvText.trim()) {
      clearBtn.classList.remove("hidden");
    } else {
      clearBtn.classList.add("hidden");
    }

    parsedData = parseCSV(csvText);
    if (parsedData) {
      renderChart();
    } else {
      if (chartInstance) chartInstance.destroy();
      canvas.style.opacity = 0;
      placeholder.classList.remove("hidden");
      controls.style.opacity = 0;
      controls.style.pointerEvents = 'none';
      if (csvText.trim()) {
        placeholder.textContent = "Format CSV tidak valid. Pastikan ada header dan setidaknya satu baris data, dengan kolom kedua berisi angka.";
      } else {
        placeholder.textContent = "Grafik akan muncul di sini";
      }
    }
  }

  csvInput.addEventListener("input", (e) => processInput(e.target.value));

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        csvInput.value = event.target.result;
        processInput(event.target.result);
      };
      reader.readAsText(file);
    }
  });

  chartTypeSelect.addEventListener("change", renderChart);
  colorSchemeSelect.addEventListener("change", renderChart);

  exampleBtn.addEventListener("click", () => {
    csvInput.value = exampleCSV;
    processInput(exampleCSV);
  });

  // Inisialisasi dropdown kustom untuk demo ini
  createCustomSelect(
    document.getElementById("chart-type-select-wrapper"),
    (value) => renderChart()
  );
  createCustomSelect(document.getElementById("chart-color-select-wrapper"), (value) => renderChart());

  clearBtn.addEventListener("click", () => {
    csvInput.value = "";
    processInput("");
    fileInput.value = ""; // Reset file input as well
  });

  downloadBtn.addEventListener("click", () => {
    if (!chartInstance) return;

    // Dapatkan nama tipe grafik yang dipilih
    const chartTypeText = chartTypeSelect.options[chartTypeSelect.selectedIndex].text.replace(/ /g, '_');

    // Buat stempel waktu YYYYMMDD_HHMMSS
    const now = new Date();
    const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;

    // Gabungkan menjadi nama file yang deskriptif
    const filename = `${chartTypeText}_${timestamp}.png`;

    const link = document.createElement('a');
    link.href = chartInstance.toBase64Image();
    link.download = filename;
    link.click();
    unlockAchievement('data_viz_master');
  });
}

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

/**
 * Creates a custom, accessible dropdown from a standard <select> element.
 * @param {HTMLElement} wrapper - The container element with the class 'custom-select-container'.
 * @param {Function} [onChangeCallback] - An optional callback function to run when the value changes.
 */
function createCustomSelect(wrapper, onChangeCallback) {
  if (!wrapper) return;

  const selectEl = wrapper.querySelector("select");
  if (!selectEl) return;

  // Create custom elements
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "custom-select-toggle";
  toggleBtn.setAttribute("aria-haspopup", "listbox");
  toggleBtn.setAttribute("aria-expanded", "false");

  const optionsContainer = document.createElement("div");
  optionsContainer.className = "custom-select-options";
  optionsContainer.setAttribute("role", "listbox");

  wrapper.appendChild(toggleBtn);
  wrapper.appendChild(optionsContainer);

  // Populate options
  Array.from(selectEl.options).forEach((option) => {
    const optionEl = document.createElement("div");
    optionEl.className = "custom-select-option";
    optionEl.dataset.value = option.value;
    optionEl.setAttribute("role", "option");

    const icon = option.dataset.icon;
    const desc = option.dataset.desc;

    let innerHTML = "";
    if (icon) {
      innerHTML += `<i data-lucide="${icon}" class="w-4 h-4 text-accent"></i>`;
    }
    innerHTML += `<div>
      <p class="font-semibold" style="color: var(--text-white);">${option.textContent}</p>
      ${desc ? `<p class="text-xs" style="color: var(--text-secondary);">${desc}</p>` : ""}
    </div>`;
    optionEl.innerHTML = innerHTML;

    optionEl.addEventListener("click", () => {
      updateSelected(option.value);
      wrapper.classList.remove("open");
      if (onChangeCallback) {
        onChangeCallback(option.value);
      }
    });
    optionsContainer.appendChild(optionEl);
  });

  function updateSelected(value) {
    const selectedOption = selectEl.querySelector(`option[value="${value}"]`);
    if (!selectedOption) return;

    selectEl.value = value;

    const icon = selectedOption.dataset.icon;
    const desc = selectedOption.dataset.desc;

    let toggleHTML = `<div class="flex items-center gap-3">`;
    if (icon) {
      toggleHTML += `<i data-lucide="${icon}" class="w-4 h-4 text-accent"></i>`;
    }
    toggleHTML += `<span class="font-semibold">${selectedOption.textContent}`;
    if (desc) {
      toggleHTML += ` <span class="font-normal opacity-70">(${desc})</span>`;
    }
    toggleHTML += `</span></div>`;
    toggleHTML += `<i data-lucide="chevron-down" class="w-4 h-4 ml-auto text-secondary"></i>`;

    toggleBtn.innerHTML = toggleHTML;
    lucide.createIcons();
  }

  // Set initial value
  updateSelected(selectEl.value);

  // Event listeners
  toggleBtn.addEventListener("click", () => {
    const isOpen = wrapper.classList.toggle("open");
    toggleBtn.setAttribute("aria-expanded", isOpen);
  });

  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) {
      wrapper.classList.remove("open");
      toggleBtn.setAttribute("aria-expanded", "false");
    }
  });

  lucide.createIcons();
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
  const algorithmSelectWrapper = document.getElementById("algorithm-select-wrapper");

  // Exit if any element is missing to prevent errors
  if (
    !gridContainer ||
    !controlsContainer ||
    !runBtn ||
    !resetBtn ||
    !algorithmSelectWrapper
  ) {
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
    
    const toggle = algorithmSelectWrapper.querySelector('.custom-select-toggle');
    if (toggle) toggle.disabled = false;

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
    
    const toggle = algorithmSelectWrapper.querySelector('.custom-select-toggle');
    if (toggle) toggle.disabled = true;

    resetGrid(false);
    unlockAchievement("navigator");

    const predecessors = new Map();
    let pathFound = false;
    const algorithm = algorithmSelectWrapper.querySelector('select').value;
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
    
    if (toggle) toggle.disabled = false;
  }

  // 4. EVENT LISTENERS
  /**
   * Initializes the custom algorithm selector dropdown.
   */
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
  createCustomSelect(algorithmSelectWrapper);
}

// --- Live Demo: Text Case Converter ---
function initializeTextConverter() {
  const inputEl = document.getElementById("text-converter-input");
  const outputEl = document.getElementById("text-converter-output");
  const controlsContainer = document.getElementById("text-converter-controls");
  const copyBtn = document.getElementById("copy-output-btn");
  const clearBtn = document.getElementById("clear-input-btn");

  const charCountEl = document.getElementById("char-count");
  const wordCountEl = document.getElementById("word-count");
  const lineCountEl = document.getElementById("line-count");

  if (!inputEl || !controlsContainer) return;

  const converters = {
    upper: (str) => str.toUpperCase(),
    lower: (str) => str.toLowerCase(),
    title: (str) =>
      str.toLowerCase().replace(/(^|\s|-)\S/g, (L) => L.toUpperCase()),
    sentence: (str) =>
      str
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()),
    camel: (str) =>
      str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)?/g, (match, chr) =>
          chr ? chr.toUpperCase() : ""
        ),
    pascal: (str) =>
      str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)?/g, (match, chr) =>
          chr ? chr.toUpperCase() : ""
        )
        .replace(/^./, (c) => c.toUpperCase()),
    kebab: (str) =>
      str
        .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2")
        .replace(/[\s_]+/g, "-")
        .toLowerCase(),
    snake: (str) =>
      str
        .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1_$2")
        .replace(/[\s-]+/g, "_")
        .toLowerCase(),
  };

  function updateStats() {
    const text = inputEl.value;
    charCountEl.textContent = text.length;
    wordCountEl.textContent = text.trim().split(/\s+/).filter(Boolean).length;
    lineCountEl.textContent = text.split("\n").length;
  }

  inputEl.addEventListener("input", updateStats);
  clearBtn.addEventListener("click", () => {
    inputEl.value = "";
    outputEl.value = "";
    updateStats();
  });
  controlsContainer.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const caseType = button.dataset.case;
      if (converters[caseType]) {
        const convertedText = converters[caseType](inputEl.value);
        outputEl.value = convertedText;
        // Animate button
        controlsContainer
          .querySelectorAll(".active")
          .forEach((b) => b.classList.remove("active"));
        button.classList.add("active");
      }
    });
  });

  copyBtn.addEventListener("click", () => {
    if (!outputEl.value) return;
    navigator.clipboard.writeText(outputEl.value).then(() => {
      const originalIcon =
        '<i data-lucide="copy" class="w-4 h-4"></i>';
      copyBtn.innerHTML = '<i data-lucide="check" class="w-4 h-4 text-green-500"></i>';
      lucide.createIcons();
      setTimeout(() => {
        copyBtn.innerHTML = originalIcon;
        lucide.createIcons();
      }, 2000);
    });
  });

  // Initial stats update
  updateStats();
}

// --- Live Demo: AI Text Analyzer ---
function initializeAiTextAnalyzer() {
  const analyzeBtn = document.getElementById("analyze-text-btn");
  const resetBtn = document.getElementById("analyzer-reset-btn");
  const inputEl = document.getElementById("text-analyzer-input");

  const inputView = document.getElementById("analyzer-input-view");
  const loaderView = document.getElementById("analyzer-loader-view");
  const resultsView = document.getElementById("analyzer-results-view");

  const codeSourceEl = document.getElementById("text-analyzer-code");

  if (!analyzeBtn || !inputEl || !inputView || !loaderView || !resultsView)
    return;

  // Populate the code block for the "View Code" button
  if (codeSourceEl) {
    codeSourceEl.innerHTML = `
      <pre data-lang="html" class="language-html"><code>&lt;textarea id="text-analyzer-input"&gt;&lt;/textarea&gt;
&lt;button id="analyze-text-btn"&gt;Analisis Teks&lt;/button&gt;
&lt;div id="text-analyzer-results"&gt;&lt;/div&gt;</code></pre>
      <pre data-lang="js" class="language-javascript"><code>async function analyzeText(text) {
  const prompt = \`
    Analyze the following text and provide the result in a JSON object.
    The JSON object must have these exact keys: "sentiment", "score", "keywords", "summary".
    - "sentiment": must be one of "Positive", "Neutral", or "Negative".
    - "score": a number between 0 and 1.
    - "keywords": an array of 3-5 most relevant keywords.
    - "summary": a one-sentence summary in Indonesian.
    Text: "\${text}"
  \`;
  // ... (API call to Gemini)
  const result = await callGeminiAPI(prompt);
  return JSON.parse(result);
}</code></pre>
    `;
  }

  const switchView = (viewToShow) => {
    [inputView, loaderView, resultsView].forEach((view) => {
      if (view === viewToShow) {
        view.classList.remove("hidden");
      } else {
        view.classList.add("hidden");
      }
    });
  };

  resetBtn.addEventListener("click", () => switchView(inputView));

  analyzeBtn.addEventListener("click", async () => {
    const text = inputEl.value.trim();
    if (!text) {
      Swal.fire({
        icon: "warning",
        title: "Teks Kosong",
        text: "Silakan masukkan teks untuk dianalisis.",
      });
      return;
    }

    // Switch to loader view
    switchView(loaderView);
    analyzeBtn.disabled = true;

    try {
      const prompt = `
        Analyze the following text and provide the result in a strict JSON object format.
        The JSON object must have these exact keys: "sentiment", "score", "keywords", "summary".
        - "sentiment": A string, must be one of "Positive", "Neutral", or "Negative".
        - "score": A number between 0 and 1 representing the confidence score.
        - "keywords": An array of 3 to 5 most relevant string keywords from the text.
        - "summary": A concise one-sentence summary of the text in Indonesian.

        Here is the text to analyze:
        "${text}"
      `;

      const apiKey = typeof API_KEY !== "undefined" ? API_KEY : "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });

      const result = await response.json();
      const content = result.candidates[0].content.parts[0].text;

      // Clean and parse the JSON response
      const jsonString = content.replace(/```json|```/g, "").trim();
      const analysis = JSON.parse(jsonString);

      displayResults(analysis);
    } catch (error) {
      console.error("Error analyzing text:", error);
      Swal.fire({
        icon: "error",
        title: "Analisis Gagal",
        text: "Terjadi kesalahan saat menghubungi AI. Pastikan format respons dari AI adalah JSON yang valid.",
      });
      switchView(inputView); // Kembali ke tampilan input jika terjadi error
    } finally {
      // Enable button for next use
      analyzeBtn.disabled = false;
    }
  });

  function displayResults(analysis) {
    const sentimentMap = { Positive: "😊", Neutral: "😐", Negative: "😠" };
    const sentimentColorMap = {
      Positive: "positive",
      Neutral: "neutral",
      Negative: "negative",
    };
    const sentimentColorHex = {
      Positive: "#22c55e",
      Neutral: "#a0aec0",
      Negative: "#ef4444",
    };

    const sentimentVisual = document.getElementById("sentiment-visual");
    sentimentVisual.style.color =
      sentimentColorHex[analysis.sentiment] || "#a0aec0";

    document.getElementById("sentiment-emoji").textContent =
      sentimentMap[analysis.sentiment] || "🤔";
    document.getElementById("sentiment-label").textContent = analysis.sentiment;
    document.getElementById(
      "sentiment-label"
    ).className = `sentiment-label sentiment-${
      sentimentColorMap[analysis.sentiment]
    }`;
    document.getElementById(
      "sentiment-score"
    ).textContent = `Tingkat kepercayaan: ${(analysis.score * 100).toFixed(
      0
    )}%`;

    const keywordsContainer = document.getElementById("keywords-result");
    keywordsContainer.innerHTML = analysis.keywords
      .map((kw) => `<span class="keyword-tag">${kw}</span>`)
      .join("");

    document.getElementById("summary-result").textContent = analysis.summary;

    // Switch to results view
    switchView(resultsView);
    lucide.createIcons();
  }
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
    const headerContentWrapper = document.createElement("div");
    headerContentWrapper.className = "flex justify-between items-center w-full";

    const tabContainer = document.createElement("div");
    tabContainer.className = "code-viewer-tabs";

    const closeButton = document.createElement("button");
    closeButton.className = "modal-close-btn";
    closeButton.setAttribute("aria-label", "Close Code Viewer");
    closeButton.innerHTML = '<i data-lucide="x" class="w-5 h-5"></i>';
    closeButton.onclick = closeModal;

    headerContentWrapper.append(tabContainer, closeButton);
    modalHeader.appendChild(headerContentWrapper);

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
    copyButton.title = "Salin kode";
    copyButton.innerHTML = '<i data-lucide="copy" class="w-4 h-4"></i>';
    copyButton.addEventListener("click", () => {
      const activeCodeBlock = modalContent.querySelector(
        ".code-block-wrapper:not(.hidden) code"
      );
      if (activeCodeBlock) {
        navigator.clipboard
          .writeText(activeCodeBlock.textContent.trim())
          .then(() => {
            copyButton.innerHTML =
              '<i data-lucide="check" class="w-4 h-4 mr-2"></i>Disalin!';
            lucide.createIcons();
            setTimeout(() => {
              copyButton.innerHTML =
                '<i data-lucide="copy" class="w-4 h-4"></i>';
              lucide.createIcons();
            }, 2000);
          });
      }
    });
    modalContent.appendChild(copyButton);

    // tampilkan modal + highlight
    Prism.highlightAllUnder(modalContent);
    lucide.createIcons();
    modal.classList.add("open");
    lockBodyScroll();

    Prism.hooks.add("complete", () => {
      if (modal.classList.contains("open") && relayout) {
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
