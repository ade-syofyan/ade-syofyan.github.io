// --- Live Demo: CSV to Chart Generator ---
function initializeCsvToChartGenerator() {
  const csvInput = document.getElementById("csv-input");
  const fileInput = document.getElementById("csv-file-input");
  const exampleBtn = document.getElementById("csv-example-btn");
  const clearBtn = document.getElementById("csv-clear-btn");
  const downloadBtn = document.getElementById("csv-download-btn");
  const fullscreenBtn = document.getElementById("csv-fullscreen-btn");
  const chartContainer = document.getElementById("chart-output-container");
  const canvas = document.getElementById("csv-chart-canvas");
  const canvasModal = document.getElementById("csv-chart-canvas-modal");
  const placeholderInitial = document.getElementById(
    "chart-placeholder-initial"
  );
  const placeholderError = document.getElementById("chart-placeholder-error");
  const chartModal = document.getElementById("chartModal");

  const controls = document.getElementById("chart-controls");
  const dataSelectorsContainer = document.getElementById(
    "chart-data-selectors"
  );
  const chartTypeSelect = document.getElementById("chart-type-select");
  const colorSchemeSelect = document.getElementById("chart-color-select");
  const dataColumnsCheckboxes = document.getElementById(
    "data-columns-checkboxes"
  );

  const codeSourceEl = document.getElementById("csv-chart-code");

  if (!csvInput || !canvas || !canvasModal || !chartModal) return;

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
      "rgba(99, 179, 237, 0.7)",
      "rgba(129, 199, 247, 0.7)",
      "rgba(159, 219, 252, 0.7)",
    ],
    tableau: [
      "rgba(78, 121, 167, 0.7)",
      "rgba(242, 142, 43, 0.7)",
      "rgba(225, 87, 89, 0.7)",
      "rgba(118, 183, 178, 0.7)",
      "rgba(89, 161, 79, 0.7)",
      "rgba(237, 201, 72, 0.7)",
      "rgba(175, 122, 161, 0.7)",
      "rgba(255, 157, 167, 0.7)",
      "rgba(156, 117, 95, 0.7)",
      "rgba(186, 176, 172, 0.7)",
    ],
    sunset: [
      "rgba(252, 165, 165, 0.7)",
      "rgba(251, 113, 133, 0.7)",
      "rgba(244, 63, 94, 0.7)",
      "rgba(225, 29, 72, 0.7)",
      "rgba(159, 18, 57, 0.7)",
    ],
    ocean: [
      "rgba(165, 243, 252, 0.7)",
      "rgba(56, 189, 248, 0.7)",
      "rgba(14, 116, 144, 0.7)",
      "rgba(21, 94, 117, 0.7)",
      "rgba(8, 47, 73, 0.7)",
    ],
    viridis: ["#440154", "#414487", "#2A788E", "#22A884", "#7AD151", "#FDE725"],
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
      const lines = csvText.trim().split("\n");
      if (lines.length < 2) return null;

      const headers = lines[0]
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean);
      if (headers.length < 2) return null;

      const data = lines
        .slice(1)
        .filter((line) => line.trim() !== "") // Abaikan baris kosong
        .map((line) => {
          const values = line.split(",");
          let entry = {};
          headers.forEach((header, i) => {
            const value = values[i] ? values[i].trim() : "";
            entry[header] =
              !isNaN(parseFloat(value)) && isFinite(value)
                ? Number(value)
                : value;
          });
          return entry;
        });

      // Validasi baru: Pastikan setidaknya ada SATU kolom data numerik (selain kolom label pertama).
      const dataColumns = headers.slice(1);
      const hasNumericColumn = dataColumns.some((header) =>
        data.every((row) => typeof row[header] === "number")
      );
      if (!hasNumericColumn) {
        return null;
      }

      return { headers, data };
    } catch (e) {
      console.error("CSV Parsing error:", e);
      return null;
    }
  }

  function populateDataSelectors() {
    if (!parsedData) return;

    const { headers, data } = parsedData;
    const labelWrapper = document.getElementById("label-column-select-wrapper");

    labelWrapper.innerHTML = "";
    dataColumnsCheckboxes.innerHTML = "";

    // Buat dropdown untuk kolom label
    const labelSelect = document.createElement("select");
    labelSelect.id = "label-column-select";
    labelSelect.className = "hidden";
    headers.forEach((header, index) => {
      const option = document.createElement("option");
      option.value = header;
      option.textContent = header;
      option.dataset.icon = "list";
      if (index === 0) option.selected = true;
      labelSelect.appendChild(option);
    });
    labelWrapper.appendChild(labelSelect);
    // --- PERBAIKAN ---
    // Modifikasi callback untuk menonaktifkan checkbox yang sesuai sebelum me-render ulang.
    createCustomSelect(labelWrapper, (selectedLabel) => {
      // Loop melalui semua checkbox kolom data
      const allCheckboxes = document.querySelectorAll(
        '#data-columns-checkboxes input[type="checkbox"]'
      );
      allCheckboxes.forEach((cb) => {
        const wrapper = cb.closest(".flex.items-center.justify-between");
        if (wrapper) {
          // Jika nilai checkbox sama dengan label yang baru dipilih, sembunyikan. Jika tidak, tampilkan.
          wrapper.style.display = cb.value === selectedLabel ? "none" : "flex";
        }
      });

      // Render ulang chart dengan konfigurasi baru
      renderChart();
    });

    // Buat checkboxes untuk kolom data
    const numericHeaders = headers.filter((h) =>
      data.every((row) => typeof row[h] === "number")
    );
    const schemeColors =
      colorSchemes[colorSchemeSelect.value] || colorSchemes.default;

    headers.forEach((header) => {
      const isNumeric = data.every((row) => typeof row[header] === "number");
      const checkboxId = `data-col-${header.replace(/\s/g, "-")}`;

      const controlWrapper = document.createElement("div");
      controlWrapper.className = "flex items-center justify-between";
      const label = document.createElement("label");
      label.className = "custom-checkbox-label";
      label.htmlFor = checkboxId;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = checkboxId;
      checkbox.className = "custom-checkbox";
      checkbox.value = header;
      // Secara default, centang kolom numerik yang BUKAN kolom label pertama
      checkbox.checked = isNumeric && header !== headers[0];

      // --- PERBAIKAN ---
      // Tambahkan logika cerdas pada event change
      checkbox.addEventListener("change", (e) => {
        const currentLabelColumn = document.getElementById(
          "label-column-select"
        ).value;
        const selectedDataColumn = e.target.value;

        // Jika user mencentang kolom yang saat ini menjadi label
        if (e.target.checked && selectedDataColumn === currentLabelColumn) {
          // Cari dan pilih label baru yang valid (kolom pertama yang tidak dicentang)
          const firstAvailableLabel = headers.find((h) => {
            const cb = document.querySelector(
              `#data-columns-checkboxes input[value="${h}"]`
            );
            return !cb || !cb.checked;
          });
          if (firstAvailableLabel)
            document
              .querySelector(
                `#label-column-select-wrapper .custom-select-toggle`
              )
              .click(); // Buka dropdown
        }
        renderChart();
      });

      // --- Redesain Pemilih Warna ---
      const colorPickerWrapper = document.createElement("div");
      colorPickerWrapper.className = "color-picker-wrapper";

      const colorInput = document.createElement("input");
      colorInput.type = "color";
      colorInput.className = "color-picker-input";
      colorInput.id = `color-for-${checkboxId}`;

      const colorSwatch = document.createElement("div");
      colorSwatch.className = "color-picker-swatch";

      colorInput.addEventListener("input", () => {
        colorSwatch.style.backgroundColor = colorInput.value;
        renderChart();
      });

      // Tetapkan warna awal dari skema
      const numericIndex = numericHeaders.indexOf(header);
      if (numericIndex !== -1) {
        const colorHex = schemeColors[numericIndex % schemeColors.length];
        const hexValue = rgbaToHex(colorHex);
        colorInput.value = hexValue;
        colorSwatch.style.backgroundColor = hexValue;
      } else {
        colorPickerWrapper.style.display = "none"; // Sembunyikan jika bukan numerik
      }

      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(header));
      controlWrapper.appendChild(label);
      colorPickerWrapper.appendChild(colorInput);
      colorPickerWrapper.appendChild(colorSwatch);
      controlWrapper.appendChild(colorPickerWrapper);
      dataColumnsCheckboxes.appendChild(controlWrapper);
    });
    dataSelectorsContainer.classList.remove("hidden");
    renderChart(); // Panggil renderChart setelah populate selesai
  }

  function destroyAllCharts() {
    // Hancurkan instance chart yang mungkin ada di kedua canvas
    if (Chart.getChart(canvas)) Chart.getChart(canvas).destroy();
    if (Chart.getChart(canvasModal)) Chart.getChart(canvasModal).destroy();

    if (chartInstance) {
      chartInstance.destroy();
    }
    fullscreenBtn.classList.add("hidden"); // Sembunyikan tombol fullscreen saat chart dihancurkan

    placeholderInitial.classList.add("hidden");
    canvas.style.opacity = 0;
  }

  function renderChart(targetCanvas = canvas) {
    if (!parsedData) return;

    const labelColumn = document.getElementById("label-column-select").value;
    const selectedCheckboxes = Array.from(
      document.querySelectorAll(
        '#data-columns-checkboxes input[type="checkbox"]:checked'
      )
    );
    const selectedDataColumns = selectedCheckboxes.map((cb) => cb.value);

    destroyAllCharts();

    if (selectedDataColumns.length === 0) {
      // Jika tidak ada kolom data yang dipilih, jangan render apa-apa
      fullscreenBtn.classList.add("hidden");
      return;
    }

    placeholderError.classList.add("hidden");
    dataSelectorsContainer.classList.remove("hidden");
    controls.style.opacity = 1;
    controls.style.pointerEvents = "auto";
    fullscreenBtn.classList.remove("hidden"); // Tampilkan tombol fullscreen

    // Tentukan canvas mana yang akan digunakan
    const ctx = targetCanvas.getContext("2d");

    // Ambil label dari kolom pertama
    const labels = parsedData.data.map((row) => row[labelColumn]);
    const chartType = document.getElementById("chart-type-select").value;

    // Buat dataset untuk setiap kolom numerik (selain kolom pertama)
    const datasets = selectedCheckboxes.map((checkbox, index) => {
      const header = checkbox.value;
      const colorInput = document.getElementById(`color-for-${checkbox.id}`);
      const hexColor = colorInput.value;
      const mainColor = hexToRgba(hexColor, 0.7);
      const data = parsedData.data.map((row) => row[header]);

      return {
        label: header,
        data: data,
        backgroundColor: mainColor,
        borderColor: hexColor,
        borderWidth: 1.5,
      };
    });

    chartInstance = new Chart(ctx, {
      type: chartType,
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            // Tampilkan legenda jika ada lebih dari satu dataset, atau jika tipenya pie/doughnut
            display:
              datasets.length > 1 ||
              ["pie", "doughnut", "polarArea"].includes(chartType),
            position: "top",
            labels: {
              color: getComputedStyle(
                document.documentElement
              ).getPropertyValue("--text-secondary"),
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "rgba(128, 128, 128, 0.2)" },
            ticks: {
              color: getComputedStyle(
                document.documentElement
              ).getPropertyValue("--text-secondary"),
            },
          },
          x: {
            grid: { display: false },
            ticks: {
              color: getComputedStyle(
                document.documentElement
              ).getPropertyValue("--text-secondary"),
            },
          },
        },
      },
    });

    // Animate chart appearance (hanya untuk canvas inline)
    if (targetCanvas === canvas) {
      setTimeout(() => {
        canvas.style.transition = "opacity 0.5s ease-in-out";
        canvas.style.opacity = 1;
      }, 100);
    }
  }

  function processInput(csvText) {
    if (csvText.trim()) {
      clearBtn.classList.remove("hidden");
    } else {
      clearBtn.classList.add("hidden");
    }

    parsedData = parseCSV(csvText);
    if (parsedData) {
      populateDataSelectors();
      // renderChart() dipanggil di dalam populateDataSelectors
    } else {
      destroyAllCharts();
      canvas.style.opacity = 0; // Sembunyikan canvas jika ada
      controls.style.opacity = 0;
      controls.style.pointerEvents = "none";
      dataSelectorsContainer.classList.add("hidden");
      if (csvText.trim()) {
        placeholderInitial.classList.add("hidden");
        placeholderError.classList.remove("hidden");
      } else {
        // Jika input benar-benar kosong
        placeholderInitial.classList.remove("hidden");
        placeholderError.classList.add("hidden");
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

  // Event listener untuk dropdown skema warna
  const colorSelectWrapper = document.getElementById(
    "chart-color-select-wrapper"
  );
  if (colorSelectWrapper) {
    createCustomSelect(colorSelectWrapper, (selectedScheme) => {
      if (!parsedData) return;
      const schemeColors = colorSchemes[selectedScheme] || colorSchemes.default;
      const numericHeaders = parsedData.headers.filter((h) =>
        parsedData.data.every((row) => typeof row[h] === "number")
      );

      numericHeaders.forEach((header, index) => {
        const checkboxId = `data-col-${header.replace(/\s/g, "-")}`;
        const colorInput = document.getElementById(`color-for-${checkboxId}`);
        if (colorInput)
          colorInput.value = rgbaToHex(
            schemeColors[index % schemeColors.length]
          );
      });
      renderChart();
    });
  }

  exampleBtn.addEventListener("click", () => {
    csvInput.value = exampleCSV;
    processInput(exampleCSV); // Ini akan memicu populate dan render
  });

  // Inisialisasi dropdown kustom untuk demo ini
  createCustomSelect(
    document.getElementById("chart-type-select-wrapper"),
    (value) => renderChart()
  );

  clearBtn.addEventListener("click", () => {
    csvInput.value = "";
    processInput("");
    fileInput.value = ""; // Reset file input as well
  });

  downloadBtn.addEventListener("click", () => {
    if (!chartInstance) return;

    // Dapatkan nama tipe grafik yang dipilih
    const chartTypeText = document
      .getElementById("chart-type-select")
      .options[
        document.getElementById("chart-type-select").selectedIndex
      ].text.replace(/ /g, "_");

    // Buat stempel waktu YYYYMMDD_HHMMSS
    const now = new Date();
    const timestamp = `${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}_${now
      .getHours()
      .toString()
      .padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;

    // Gabungkan menjadi nama file yang deskriptif
    const filename = `${chartTypeText}_${timestamp}.png`;

    const link = document.createElement("a");
    link.href = chartInstance.toBase64Image();
    link.download = filename;
    link.click();
    unlockAchievement("data_viz_master");
  });

  // --- Logika untuk Modal Grafik ---
  window.closeChartModal = function () {
    chartModal.classList.remove("open");
    unlockBodyScroll();
    renderChart(canvas); // Render ulang di canvas inline setelah modal ditutup
  };

  chartModal.addEventListener("click", (e) => {
    if (e.target === chartModal) window.closeChartModal();
  });

  fullscreenBtn.addEventListener("click", () => {
    if (!parsedData) return;
    renderChart(canvasModal); // Render grafik di canvas modal
    chartModal.classList.add("open");
    lockBodyScroll();
  });

  // --- Helper Functions for Color Conversion ---
  function rgbaToHex(rgba) {
    if (rgba.startsWith("#")) return rgba; // Already hex
    const parts = rgba
      .substring(rgba.indexOf("(") + 1, rgba.lastIndexOf(")"))
      .split(/,\s*/);
    const r = parseInt(parts[0], 10);
    const g = parseInt(parts[1], 10);
    const b = parseInt(parts[2], 10);
    return (
      "#" +
      ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
    );
  }

  function hexToRgba(hex, alpha = 1) {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split("");
      if (c.length == 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = "0x" + c.join("");
      const r = (c >> 16) & 255;
      const g = (c >> 8) & 255;
      const b = c & 255;
      return `rgba(${r},${g},${b},${alpha})`;
    }
    throw new Error("Bad Hex");
  }
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

  // Hapus isi wrapper untuk membangun ulang dari awal
  wrapper.innerHTML = "";

  // Buat elemen-elemen baru untuk dropdown kustom
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "custom-select-toggle";
  wrapper.appendChild(toggleBtn);

  const optionsContainer = document.createElement("div");
  optionsContainer.className = "custom-select-options";
  wrapper.appendChild(optionsContainer);

  // Pindahkan select asli ke dalam wrapper jika belum ada
  wrapper.appendChild(selectEl);

  toggleBtn.setAttribute("aria-haspopup", "listbox");
  toggleBtn.setAttribute("aria-expanded", "false");

  optionsContainer.setAttribute("role", "listbox");
  // Clear any existing options to prevent duplication on re-init
  optionsContainer.innerHTML = "";

  // --- FITUR PENCARIAN BARU ---
  const searchWrapper = document.createElement("div");
  searchWrapper.className = "custom-select-search-wrapper";
  const searchInput = document.createElement("input");
  searchInput.type = "search";
  searchInput.className = "custom-select-search-input";
  searchInput.placeholder = "Pencarian...";
  searchInput.setAttribute("aria-label", "Pencarian");

  // Hentikan propagasi klik agar dropdown tidak tertutup saat mengklik input
  searchInput.addEventListener("click", (e) => e.stopPropagation());

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const options = optionsContainer.querySelectorAll(".custom-select-option");
    options.forEach((option) => {
      // Cari berdasarkan teks konten (nama negara) atau nilai (kode telepon)
      const text = option.textContent.toLowerCase();
      const value = option.dataset.value.toLowerCase();
      const isVisible = text.includes(query) || value.includes(query);
      option.classList.toggle("hidden", !isVisible);
    });
  });

  searchWrapper.appendChild(searchInput);
  optionsContainer.appendChild(searchWrapper);
  // --- AKHIR FITUR PENCARIAN ---

  // Populate options
  Array.from(selectEl.options).forEach((option) => {
    // Skip if option is empty (often a placeholder)
    if (!option.value && !option.textContent) return;
    const optionEl = document.createElement("div");
    optionEl.className = "custom-select-option";
    optionEl.dataset.value = option.value;
    optionEl.setAttribute("role", "option");

    // --- PERBAIKAN: Logika render opsi yang lebih fleksibel ---
    // Cek apakah ini dropdown kode negara (berdasarkan dataset.name)
    if (option.dataset.name) {
      // Render spesifik untuk dropdown kode negara
      // --- PERBAIKAN: Gunakan dataset.code untuk bendera, bukan dataset.icon ---
      optionEl.innerHTML = `
        <span class="text-xl leading-none flag-icon flag-icon-${
          option.dataset.code ? option.dataset.code.toLowerCase() : ""
        }"></span>
        <div class="flex-grow text-left">
          <p class="font-semibold text-sm" style="color: var(--text-white);">${
            option.dataset.name
          } <span class="font-normal" style="color: var(--text-secondary);">(+${
        option.value
      })</span></p>
          ${
            option.dataset.desc
              ? `<p class="text-xs" style="color: var(--text-secondary);">${option.dataset.desc}</p>`
              : ""
          }
        </div>
      `;
    } else {
      // Render generik untuk dropdown lainnya (CSV Chart, Pathfinding, dll.)
      let content = "";
      if (option.dataset.icon) {
        content += `<i data-lucide="${option.dataset.icon}" class="w-4 h-4 mr-2 text-accent"></i>`;
      }
      content += `<span class="font-semibold text-sm">${option.textContent}</span>`;
      optionEl.innerHTML = content;
      optionEl.classList.add("flex", "items-center");
    }

    optionEl.addEventListener("click", () => {
      updateSelected(option.value);
      wrapper.classList.remove("open");
      // Reset filter pencarian setelah memilih
      searchInput.value = "";
      optionsContainer
        .querySelectorAll(".custom-select-option")
        .forEach((opt) => opt.classList.remove("hidden"));
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

    // --- PERBAIKAN: Logika render tombol toggle yang fleksibel ---
    let toggleHTML = "";
    // Cek apakah ini dropdown kode negara
    if (selectedOption.dataset.name) {
      // --- PERBAIKAN: Gunakan dataset.code untuk bendera, bukan dataset.icon ---
      toggleHTML = `<div class="flex items-center gap-3">
        <span class="text-base leading-none flag-icon flag-icon-${
          selectedOption.dataset.code
            ? selectedOption.dataset.code.toLowerCase()
            : ""
        }"></span>
        <span class="font-semibold">${selectedOption.dataset.name} (+${
        selectedOption.value
      })</span>
      </div>`;
    } else {
      // Render generik untuk dropdown lainnya
      // --- PERBAIKAN: Tampilkan ikon yang terpilih di tombol toggle ---
      let content = "";
      if (selectedOption.dataset.icon) {
        content += `<i data-lucide="${selectedOption.dataset.icon}" class="w-4 h-4 mr-2 text-accent"></i>`;
      }
      content += `<span>${selectedOption.textContent}</span>`;
      toggleHTML = `<div class="flex items-center">${content}</div>`;
    }

    // Selalu tambahkan ikon panah di akhir
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
    // Fokus ke input pencarian saat dropdown dibuka
    if (isOpen) searchInput.focus();
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
  // Mengambil elemen select asli dan wrapper-nya
  const algorithmSelect = document.getElementById("algorithm-select");
  const algorithmSelectWrapper = document.getElementById(
    "algorithm-select-custom"
  );

  // Exit if any element is missing to prevent errors
  if (
    !gridContainer ||
    !controlsContainer ||
    !runBtn ||
    !resetBtn ||
    !algorithmSelect ||
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

    const toggle = algorithmSelectWrapper.querySelector(
      ".custom-select-toggle"
    );
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
    if (!startNode || !endNode) {
      gridContainer.classList.add("shake-animation");
      setTimeout(() => gridContainer.classList.remove("shake-animation"), 500);
      Swal.fire({
        icon: "warning",
        title: "Input Tidak Lengkap",
        text: "Harap tentukan titik Mulai dan Akhir pada grid.",
      });
      return;
    }
    if (isRunning) return;

    isRunning = true;
    runBtn.disabled = true;
    resetBtn.disabled = true;
    controlsContainer
      .querySelectorAll(".pathfinding-btn")
      .forEach((btn) => (btn.disabled = true));

    const toggle = algorithmSelectWrapper.querySelector(
      ".custom-select-toggle"
    );
    if (toggle) toggle.disabled = true;

    resetGrid(false);
    unlockAchievement("navigator");

    const predecessors = new Map();
    let pathFound = false;
    const algorithm = document.getElementById("algorithm-select").value;
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
  // Pindahkan select ke dalam wrapper sebelum membuat dropdown kustom
  algorithmSelectWrapper.appendChild(algorithmSelect);
  createCustomSelect(algorithmSelectWrapper, null);
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
      str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()),
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
      const originalIcon = '<i data-lucide="copy" class="w-4 h-4"></i>';
      copyBtn.innerHTML =
        '<i data-lucide="check" class="w-4 h-4 text-green-500"></i>';
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

function initializePdfSigner() {
  const uploadView = document.getElementById("pdf-signer-upload-view");
  const mainView = document.getElementById("pdf-signer-main-view");
  const uploadInput = document.getElementById("pdf-upload-input");
  const uploadArea = document.querySelector(".pdf-upload-area-v2");

  const pdfViewerContainer = document.getElementById("pdf-viewer-container");
  const pdfStage = document.getElementById("pdf-stage");
  const pdfCanvas = document.getElementById("pdf-render-canvas");
  const pdfCtx = pdfCanvas.getContext("2d");
  const loadingSpinner = document.getElementById("pdf-loading-spinner");

  const sigPadCanvas = document.getElementById("signature-pad-canvas");
  const sigPadCtx = sigPadCanvas.getContext("2d");
  const clearSigBtn = document.getElementById("clear-signature-btn");
  const placeSigBtn = document.getElementById("place-signature-btn");

  const sigDragContainer = document.getElementById("signature-drag-container");
  const sigImg = document.getElementById("placed-signature-img");
  const removeSigBtn = document.getElementById("remove-signature-btn");

  const prevPageBtn = document.getElementById("pdf-prev-page");
  const nextPageBtn = document.getElementById("pdf-next-page");
  const currentPageEl = document.getElementById("pdf-current-page");
  const totalPagesEl = document.getElementById("pdf-total-pages");

  const tabs = document.querySelectorAll(".pdf-controls-tab");
  const tabContents = document.querySelectorAll(".pdf-tab-content");

  const downloadSignedPdfBtn = document.getElementById(
    "download-signed-pdf-btn"
  );
  const downloadSigPngBtn = document.getElementById(
    "download-signature-png-btn"
  );
  const resetBtn = document.getElementById("pdf-signer-reset-btn");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Nonaktifkan semua tab dan konten
      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((c) => c.classList.add("hidden"));

      // Aktifkan tab yang diklik
      tab.classList.add("active");
      const contentId = `pdf-tab-${tab.dataset.tab}`;
      document.getElementById(contentId)?.classList.remove("hidden");
    });
  });

  // Text controls
  const addTextBtn = document.getElementById("add-text-btn");
  const textColorInp = document.getElementById("text-color");
  const textSizeInp = document.getElementById("text-size");
  const removeTextBtn = document.getElementById("remove-text-btn");

  if (!uploadView) return;

  // ---------- State ----------
  const MAX_SIZE = 10 * 1024 * 1024;
  let pdfDoc = null;
  let currentPageNum = 1;
  let pdfFile = null;
  let originalPdfBytes = null;

  // Signature per page (maks 1)
  let isSignatureDrawn = false;
  const placements = new Map(); // page -> {nLeft,nTop,nWidth,nHeight,pngBytes,dataUrl,pdfRect?}
  const pageViewportMap = new Map(); // page -> pdf.js viewport (with rotation info)
  let currentViewport = null;

  // Text per page (banyak)
  // textItems: Map<pageNum, Map<id, {nLeft,nTop,nWidth,nHeight,nFont,color,text}>>
  const textItems = new Map();
  let selectedTextId = null;
  const DRAG_TOL = 6;
  const TEXT_PLACEHOLDER = "ketik...";
  const LEGACY_PLACEHOLDERS = new Set([
    "Teks…",
    "Teks...",
    "Ketik teks...",
    "ketik...",
    "ketik....",
  ]);

  // drag/resize signature
  let isDragging = false,
    isResizing = false,
    offsetX = 0,
    offsetY = 0;

  // ---------- Helpers ----------
  const getTouch = (e) => e.touches?.[0] || e.changedTouches?.[0] || e;

  async function canvasToPngBytes(canvas) {
    const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
    const buf = await blob.arrayBuffer();
    return new Uint8Array(buf);
  }

  // text-layer di atas canvas
  const textLayer = document.createElement("div");
  textLayer.id = "pdf-text-layer";
  Object.assign(textLayer.style, {
    position: "absolute",
    inset: "0",
    zIndex: "5",
    pointerEvents: "auto",
  });
  pdfStage.appendChild(textLayer);
  sigDragContainer.style.zIndex = "10";

  function syncStageSizeToCanvas() {
    pdfStage.style.width = pdfCanvas.style.width || pdfCanvas.width + "px";
    pdfStage.style.height = pdfCanvas.style.height || pdfCanvas.height + "px";
  }
  function updateVerticalCentering() {
    const contH = pdfViewerContainer.clientHeight || 0;
    const stageH = pdfStage.offsetHeight || pdfCanvas.offsetHeight || 0;
    pdfViewerContainer.style.alignItems =
      stageH > 0 && contH > 0 && stageH + 1 < contH ? "center" : "flex-start";
  }
  function updateDownloadButtonState() {
    const hasSig = placements.size > 0;
    const hasTxt = [...textItems.values()].some((m) => m.size > 0);
    downloadSignedPdfBtn.disabled = !(hasSig || hasTxt);
  }
  const ensureTextMap = (page) => {
    if (!textItems.has(page)) textItems.set(page, new Map());
    return textItems.get(page);
  };

  // ---------- PDF load/render ----------
  const handleFileSelect = (file) => {
    if (!file) return;
    if (file.type !== "application/pdf" || file.size > MAX_SIZE) {
      void Swal.fire(
        file.size > MAX_SIZE ? "File Terlalu Besar" : "File Tidak Valid",
        file.size > MAX_SIZE
          ? "Batas maksimal 10MB."
          : "Silakan unggah file berformat PDF.",
        "warning"
      );
      return;
    }
    pdfFile = file;
    uploadView.classList.add("hidden");
    mainView.classList.remove("hidden");
    loadingSpinner.style.display = "flex";

    requestAnimationFrame(() => {
      resizeSigPad();
      updateVerticalCentering();
    });

    const reader = new FileReader();
    reader.onload = async (e) => {
      originalPdfBytes = e.target.result;
      const typed = new Uint8Array(originalPdfBytes);
      try {
        pdfDoc = await pdfjsLib.getDocument({ data: typed }).promise;
        totalPagesEl.textContent = pdfDoc.numPages;
        currentPageNum = 1;
        placements.clear();
        textItems.clear();
        pageViewportMap.clear();
        currentViewport = null;
        await renderPage(currentPageNum);
      } catch (err) {
        console.error(err);
        await Swal.fire("Error", "Gagal memuat file PDF.", "error");
        resetToUploadView();
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const renderPage = async (num) => {
    if (!pdfDoc) return;
    loadingSpinner.style.display = "flex";
    try {
      const page = await pdfDoc.getPage(num);
      const viewport = page.getViewport({ scale: 1.5 });
      const containerWidth = pdfViewerContainer.clientWidth || viewport.width;
      const scale = containerWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale });
      pageViewportMap.set(num, scaledViewport);
      currentViewport = scaledViewport;

      pdfCanvas.width = Math.ceil(scaledViewport.width);
      pdfCanvas.height = Math.ceil(scaledViewport.height);
      pdfCanvas.style.width = `${scaledViewport.width}px`;
      pdfCanvas.style.height = `${scaledViewport.height}px`;

      await page.render({ canvasContext: pdfCtx, viewport: scaledViewport })
        .promise;

      syncStageSizeToCanvas();
      updateVerticalCentering();

      currentPageEl.textContent = num;
      currentPageNum = num;
      updatePageButtons();

      applyPlacementToUI(currentPageNum); // signature halaman ini
      renderTextLayerForPage(currentPageNum); // teks halaman ini

      updateDownloadButtonState();
    } finally {
      loadingSpinner.style.display = "none";
    }
  };

  const updatePageButtons = () => {
    prevPageBtn.disabled = !pdfDoc || currentPageNum <= 1;
    nextPageBtn.disabled = !pdfDoc || currentPageNum >= pdfDoc.numPages;
  };
  prevPageBtn.addEventListener("click", () => {
    if (pdfDoc && currentPageNum > 1) renderPage(currentPageNum - 1);
  });
  nextPageBtn.addEventListener("click", () => {
    if (pdfDoc && currentPageNum < pdfDoc.numPages)
      renderPage(currentPageNum + 1);
  });

  // ---------- Signature Pad ----------
  const sigColorInput = document.getElementById("sig-color");
  const sigWidthInput = document.getElementById("sig-width");
  let drawing = false,
    lastX = 0,
    lastY = 0;
  let penColor = sigColorInput?.value || "#000000";
  let penWidth = +(sigWidthInput?.value || 2);

  function resizeSigPad() {
    sigPadCanvas.style.width = "";
    sigPadCanvas.style.height = "";
    let rect = sigPadCanvas.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      const cs = getComputedStyle(sigPadCanvas);
      const w =
        parseFloat(cs.width) || sigPadCanvas.parentElement?.clientWidth || 300;
      const h = parseFloat(cs.height) || 160;
      rect = { width: w, height: h };
    }
    const dpr = window.devicePixelRatio || 1;
    sigPadCanvas.width = Math.max(1, Math.round(rect.width * dpr));
    sigPadCanvas.height = Math.max(1, Math.round(rect.height * dpr));
    sigPadCanvas.style.width = rect.width + "px";
    sigPadCanvas.style.height = rect.height + "px";
    sigPadCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sigPadCtx.lineCap = "round";
    sigPadCtx.lineJoin = "round";
    sigPadCtx.strokeStyle = penColor;
    sigPadCtx.lineWidth = penWidth;
  }
  sigColorInput?.addEventListener("input", (e) => {
    penColor = e.target.value || "#000000";
    sigPadCtx.strokeStyle = penColor;
  });
  sigWidthInput?.addEventListener("input", (e) => {
    penWidth = +e.target.value || 2;
    sigPadCtx.lineWidth = penWidth;
  });

  const getPos = (canvas, e) => {
    const r = canvas.getBoundingClientRect();
    const t = getTouch(e);
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  };
  const startDrawing = (e) => {
    drawing = true;
    e.preventDefault();
    const p = getPos(sigPadCanvas, e);
    [lastX, lastY] = [p.x, p.y];
    sigPadCtx.beginPath();
  };
  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const p = getPos(sigPadCanvas, e);
    sigPadCtx.moveTo(lastX, lastY);
    sigPadCtx.lineTo(p.x, p.y);
    sigPadCtx.stroke();
    [lastX, lastY] = [p.x, p.y];
    isSignatureDrawn = true;
    placeSigBtn.disabled = false;
  };
  const stopDrawing = () => {
    drawing = false;
    sigPadCtx.beginPath();
  };
  const clearSignature = () => {
    sigPadCtx.clearRect(0, 0, sigPadCanvas.width, sigPadCanvas.height);
    isSignatureDrawn = false;
    placeSigBtn.disabled = true;
  };

  placeSigBtn.addEventListener("click", async () => {
    if (!isSignatureDrawn) {
      void Swal.fire(
        "Tunggu!",
        "Silakan buat tanda tangan terlebih dahulu.",
        "info"
      );
      return;
    }
    const pngBytes = await canvasToPngBytes(sigPadCanvas);
    const dataUrl = sigPadCanvas.toDataURL("image/png");
    sigImg.src = dataUrl;
    sigDragContainer.classList.remove("hidden");
    sigDragContainer.style.width = "150px";
    sigDragContainer.style.height = "75px";
    sigDragContainer.style.left = "50px";
    sigDragContainer.style.top = "50px";
    const stageRect = pdfStage.getBoundingClientRect();
    const stageWidth = stageRect.width || 1;
    const stageHeight = stageRect.height || 1;
    placements.set(currentPageNum, {
      nLeft: 50 / stageWidth,
      nTop: 50 / stageHeight,
      nWidth: 150 / stageWidth,
      nHeight: 75 / stageHeight,
      pngBytes,
      dataUrl,
    });
    saveOverlayToMap();
    updateDownloadButtonState();
  });

  function applyPlacementToUI(pageNum) {
    const p = placements.get(pageNum);
    if (!p) {
      sigDragContainer.classList.add("hidden");
      return;
    }
    sigImg.src = p.dataUrl;
    const stageRect = pdfStage.getBoundingClientRect();
    sigDragContainer.style.width = `${p.nWidth * stageRect.width}px`;
    sigDragContainer.style.height = `${p.nHeight * stageRect.height}px`;
    sigDragContainer.style.left = `${p.nLeft * stageRect.width}px`;
    sigDragContainer.style.top = `${p.nTop * stageRect.height}px`;
    sigDragContainer.classList.remove("hidden");
    saveOverlayToMap();
  }
  function saveOverlayToMap() {
    const stageRect = pdfStage.getBoundingClientRect();
    const rect = sigDragContainer.getBoundingClientRect();
    const p = placements.get(currentPageNum);
    if (!p) return;
    const stageWidth = stageRect.width;
    const stageHeight = stageRect.height;
    if (!stageWidth || !stageHeight) return;
    const viewport = getViewportForPage(currentPageNum);
    const pdfQuad = computePdfQuad(viewport, stageRect, rect);
    const pdfRectFromQuad = quadToRect(pdfQuad);
    const pdfRect = computePdfRect(viewport, stageRect, rect);
    placements.set(currentPageNum, {
      ...p,
      nLeft: (rect.left - stageRect.left) / stageWidth,
      nTop: (rect.top - stageRect.top) / stageHeight,
      nWidth: rect.width / stageWidth,
      nHeight: rect.height / stageHeight,
      pdfRect: pdfRectFromQuad || pdfRect || p.pdfRect || null,
      pdfQuad: pdfQuad || p.pdfQuad || null,
      rotation: viewport?.rotation ?? p.rotation ?? 0,
    });
  }
  removeSigBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    placements.delete(currentPageNum);
    sigDragContainer.classList.add("hidden");
    updateDownloadButtonState();
  });

  sigImg.setAttribute("draggable", "false");
  sigImg.style.pointerEvents = "none";
  sigDragContainer.style.touchAction = "none";
  const clamp = (v, min, max) => Math.max(min, Math.min(v, max));
  sigDragContainer.addEventListener("pointerdown", (e) => {
    if (e.target.id === "remove-signature-btn") return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    if (e.target.classList?.contains("resize-handle")) {
      isResizing = true;
    } else {
      isDragging = true;
      const r = sigDragContainer.getBoundingClientRect();
      offsetX = e.clientX - r.left;
      offsetY = e.clientY - r.top;
    }
    try {
      sigDragContainer.setPointerCapture(e.pointerId);
    } catch {}
    pdfViewerContainer.style.userSelect = "none";
  });
  sigDragContainer.addEventListener("pointermove", (e) => {
    if (!isDragging && !isResizing) return;
    const stageRect = pdfStage.getBoundingClientRect();
    if (isDragging) {
      let x = e.clientX - stageRect.left - offsetX,
        y = e.clientY - stageRect.top - offsetY;
      x = clamp(x, 0, stageRect.width - sigDragContainer.offsetWidth);
      y = clamp(y, 0, stageRect.height - sigDragContainer.offsetHeight);
      sigDragContainer.style.left = `${x}px`;
      sigDragContainer.style.top = `${y}px`;
    } else {
      const r = sigDragContainer.getBoundingClientRect();
      let w = e.clientX - r.left,
        h = e.clientY - r.top;
      w = clamp(w, 50, stageRect.width - (r.left - stageRect.left));
      h = clamp(h, 30, stageRect.height - (r.top - stageRect.top));
      sigDragContainer.style.width = `${w}px`;
      sigDragContainer.style.height = `${h}px`;
    }
  });
  const endPointer = (e) => {
    if (!isDragging && !isResizing) return;
    isDragging = false;
    isResizing = false;
    try {
      sigDragContainer.releasePointerCapture(e.pointerId);
    } catch {}
    pdfViewerContainer.style.userSelect = "auto";
    if (placements.has(currentPageNum)) saveOverlayToMap();
  };
  sigDragContainer.addEventListener("pointerup", endPointer);
  sigDragContainer.addEventListener("pointercancel", endPointer);

  // ---------- TEXT helpers ----------
  function hexToRgb01(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return { r: 0, g: 0, b: 0 };
    return {
      r: parseInt(m[1], 16) / 255,
      g: parseInt(m[2], 16) / 255,
      b: parseInt(m[3], 16) / 255,
    };
  }
  function newId() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
  function rgbToHex(rgbStr) {
    const m = rgbStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!m) return null;
    const toHex = (n) => ("0" + parseInt(n, 10).toString(16)).slice(-2);
    return `#${toHex(m[1])}${toHex(m[2])}${toHex(m[3])}`;
  }
  function getSelectedTextEl() {
    if (!selectedTextId) return null;
    return (
      [...textLayer.children].find((n) => n.dataset?.id === selectedTextId) ||
      null
    );
  }
  function syncControlsWithSelection(el) {
    if (!el) return;
    const cs = getComputedStyle(el);
    const m = cs.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    const toHex = (n) => ("0" + parseInt(n, 10).toString(16)).slice(-2);
    const hex = m ? `#${toHex(m[1])}${toHex(m[2])}${toHex(m[3])}` : "#000000";
    if (textColorInp) textColorInp.value = hex;
    if (textSizeInp)
      textSizeInp.value = Math.round(parseFloat(cs.fontSize) || 16);
  }
  function clearTextSelectionUI() {
    selectedTextId = null;
    [...textLayer.children].forEach((el) => el.classList.remove("selected"));
  }
  function selectTextEl(el) {
    clearTextSelectionUI();
    el.classList.add("selected");
    selectedTextId = el.dataset.id;
    syncControlsWithSelection(el);
  }

  function getViewportForPage(pageNum = currentPageNum) {
    return (
      pageViewportMap.get(pageNum) ||
      (pageNum === currentPageNum ? currentViewport : null)
    );
  }

  function computePdfRect(viewport, stageRect, domRect) {
    if (!viewport || !stageRect) return null;
    const left = domRect.left - stageRect.left;
    const top = domRect.top - stageRect.top;
    const right = left + domRect.width;
    const bottom = top + domRect.height;
    if (
      Number.isNaN(left) ||
      Number.isNaN(top) ||
      Number.isNaN(right) ||
      Number.isNaN(bottom)
    ) {
      return null;
    }
    const [px1, py1] = viewport.convertToPdfPoint(left, top);
    const [px2, py2] = viewport.convertToPdfPoint(right, bottom);
    const minX = Math.min(px1, px2);
    const maxX = Math.max(px1, px2);
    const minY = Math.min(py1, py2);
    const maxY = Math.max(py1, py2);
    return {
      x: minX,
      y: minY,
      width: Math.max(0, maxX - minX),
      height: Math.max(0, maxY - minY),
    };
  }

  function computePdfFontSize(viewport, stageRect, domRect, fontPx) {
    if (!viewport || !stageRect || !fontPx) return null;
    const left = domRect.left - stageRect.left;
    const top = domRect.top - stageRect.top;
    const [pTopX, pTopY] = viewport.convertToPdfPoint(left, top);
    const [pBottomX, pBottomY] = viewport.convertToPdfPoint(left, top + fontPx);
    const dy = Math.hypot(pTopX - pBottomX, pTopY - pBottomY);
    return dy || null;
  }

  function computePdfQuad(viewport, stageRect, domRect) {
    if (!viewport || !stageRect) return null;
    const relLeft = domRect.left - stageRect.left;
    const relTop = domRect.top - stageRect.top;
    const relRight = relLeft + domRect.width;
    const relBottom = relTop + domRect.height;
    try {
      const tl = viewport.convertToPdfPoint(relLeft, relTop);
      const tr = viewport.convertToPdfPoint(relRight, relTop);
      const bl = viewport.convertToPdfPoint(relLeft, relBottom);
      const br = viewport.convertToPdfPoint(relRight, relBottom);
      if (!tl || !tr || !bl || !br) return null;
      return {
        tl: { x: tl[0], y: tl[1] },
        tr: { x: tr[0], y: tr[1] },
        bl: { x: bl[0], y: bl[1] },
        br: { x: br[0], y: br[1] },
      };
    } catch {
      return null;
    }
  }

  function quadToRect(quad) {
    if (!quad) return null;
    const xs = [quad.tl?.x, quad.tr?.x, quad.bl?.x, quad.br?.x].filter(
      (n) => typeof n === "number" && !Number.isNaN(n)
    );
    const ys = [quad.tl?.y, quad.tr?.y, quad.bl?.y, quad.br?.y].filter(
      (n) => typeof n === "number" && !Number.isNaN(n)
    );
    if (!xs.length || !ys.length) return null;
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return {
      x: minX,
      y: minY,
      width: Math.max(0, maxX - minX),
      height: Math.max(0, maxY - minY),
    };
  }

  function vectorLength(vec) {
    return Math.hypot(vec.x || 0, vec.y || 0);
  }

  function normalizedRectToPdfRect(box, viewport) {
    if (!viewport || !box) return null;
    const vw = viewport.width || 0;
    const vh = viewport.height || 0;
    if (!vw || !vh) return null;
    const left = (box.nLeft || 0) * vw;
    const top = (box.nTop || 0) * vh;
    const right = left + (box.nWidth || 0) * vw;
    const bottom = top + (box.nHeight || 0) * vh;
    const [px1, py1] = viewport.convertToPdfPoint(left, top);
    const [px2, py2] = viewport.convertToPdfPoint(right, bottom);
    const minX = Math.min(px1, px2);
    const maxX = Math.max(px1, px2);
    const minY = Math.min(py1, py2);
    const maxY = Math.max(py1, py2);
    return {
      x: minX,
      y: minY,
      width: Math.max(0, maxX - minX),
      height: Math.max(0, maxY - minY),
    };
  }

  function normalizedFontToPdf(box, viewport) {
    if (!viewport || !box || !box.nFont) return null;
    const vh = viewport.height || 0;
    if (!vh) return null;
    const fontPx = box.nFont * vh;
    const vw = viewport.width || 0;
    const left = (box.nLeft || 0) * vw;
    const top = (box.nTop || 0) * vh;
    const [pTopX, pTopY] = viewport.convertToPdfPoint(left, top);
    const [pBottomX, pBottomY] = viewport.convertToPdfPoint(left, top + fontPx);
    return Math.hypot(pTopX - pBottomX, pTopY - pBottomY) || null;
  }

  function getBoxEditableText(el) {
    if (!el) return "";
    const clone = el.cloneNode(true);
    clone
      .querySelectorAll(".resize-handle, .close-btn")
      .forEach((node) => node.remove());
    return clone.innerText || "";
  }

  function updatePlaceholderState(el, textValue) {
    if (!el) return;
    if (!el.dataset.placeholder) el.dataset.placeholder = TEXT_PLACEHOLDER;
    const value = textValue !== undefined ? textValue : getBoxEditableText(el);
    if (value.trim().length > 0) {
      delete el.dataset.empty;
    } else {
      el.dataset.empty = "1";
    }
  }

  function initializeTextBoxElement(el) {
    if (!el || el.dataset?.boxInit === "1") return;
    el.dataset.boxInit = "1";
    if (!el.dataset.placeholder) el.dataset.placeholder = TEXT_PLACEHOLDER;

    let handle = el.querySelector(".resize-handle");
    if (!handle) {
      handle = document.createElement("div");
      handle.className = "resize-handle";
      handle.contentEditable = "false";
      el.appendChild(handle);
    } else {
      handle.contentEditable = "false";
    }

    let close = el.querySelector(".close-btn");
    if (!close) {
      close = document.createElement("div");
      close.className = "close-btn";
      close.textContent = "×";
      close.contentEditable = "false";
      el.appendChild(close);
    } else {
      close.contentEditable = "false";
    }

    let startCX = 0,
      startCY = 0,
      moved = false;
    let tDragging = false,
      tResizing = false;
    let tOffsetX = 0,
      tOffsetY = 0;

    const beginPointer = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      selectTextEl(el);
      el.style.zIndex = String(Date.now() % 1e9);

      moved = false;
      startCX = e.clientX;
      startCY = e.clientY;
      tDragging = false;
      tResizing = false;

      if (e.target === close) {
        const pageMap = ensureTextMap(currentPageNum);
        pageMap.delete(el.dataset.id);
        clearTextSelectionUI();
        el.remove();
        updateDownloadButtonState();
        return;
      }

      if (e.target === handle) {
        tResizing = true;
      } else {
        tDragging = true;
        el.dataset._wasEditable = el.isContentEditable ? "1" : "0";
        el.contentEditable = "false";
        el.style.userSelect = "none";
        el.style.cursor = "grabbing";
        const r = el.getBoundingClientRect();
        tOffsetX = e.clientX - r.left;
        tOffsetY = e.clientY - r.top;
      }
      try {
        el.setPointerCapture(e.pointerId);
      } catch {}
      e.preventDefault();
    };

    const movePointer = (e) => {
      if (!tDragging && !tResizing) return;
      e.preventDefault();

      const stage = pdfStage.getBoundingClientRect();
      const r = el.getBoundingClientRect();

      if (
        !moved &&
        (Math.abs(e.clientX - startCX) > DRAG_TOL ||
          Math.abs(e.clientY - startCY) > DRAG_TOL)
      ) {
        moved = true;
      }

      if (tDragging) {
        let nx = e.clientX - stage.left - tOffsetX;
        let ny = e.clientY - stage.top - tOffsetY;
        nx = Math.max(0, Math.min(nx, stage.width - r.width));
        ny = Math.max(0, Math.min(ny, stage.height - r.height));
        el.style.left = `${nx}px`;
        el.style.top = `${ny}px`;
      } else if (tResizing) {
        let w = e.clientX - r.left;
        let h = e.clientY - r.top;
        w = Math.max(60, Math.min(w, stage.width - (r.left - stage.left)));
        h = Math.max(24, Math.min(h, stage.height - (r.top - stage.top)));
        el.style.width = `${w}px`;
        el.style.height = `${h}px`;
      }
    };

    const endPointer = (e) => {
      if (!tDragging && !tResizing) return;
      tDragging = false;
      tResizing = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}
      if (el.dataset._wasEditable === "1") {
        el.contentEditable = "true";
        if (!moved) {
          el.focus();
        }
      }
      el.style.userSelect = "";
      el.style.cursor = "";
      saveTextBox(el);
    };

    el.addEventListener("pointerdown", beginPointer);
    el.addEventListener("pointermove", movePointer);
    el.addEventListener("pointerup", endPointer);
    el.addEventListener("pointercancel", endPointer);

    el.addEventListener("input", () => saveTextBox(el));
    el.addEventListener("click", () => selectTextEl(el));
    el.addEventListener("dblclick", () => {
      el.contentEditable = "true";
      el.focus();
      selectTextEl(el);
    });

    updatePlaceholderState(el);
  }

  // Render text layer untuk halaman aktif
  function renderTextLayerForPage(pageNum) {
    textLayer.innerHTML = "";
    clearTextSelectionUI();

    const stageRect = pdfStage.getBoundingClientRect();
    const map = textItems.get(pageNum);
    if (!map) return;

    for (const [id, T] of map.entries()) {
      const el = document.createElement("div");
      el.className = "pdf-text-box";
      el.contentEditable = "true";
      el.dataset.id = id;
      const storedText = T.text || "";
      const isLegacyPlaceholder =
        !storedText.trim() || LEGACY_PLACEHOLDERS.has(storedText.trim());
      const safeText = isLegacyPlaceholder ? "" : storedText;
      if (isLegacyPlaceholder && storedText !== safeText) {
        T.text = "";
      }
      el.textContent = safeText;

      el.style.left = `${T.nLeft * stageRect.width}px`;
      el.style.top = `${T.nTop * stageRect.height}px`;
      el.style.width = `${T.nWidth * stageRect.width}px`;
      el.style.height = `${T.nHeight * stageRect.height}px`;
      el.style.color = T.color || "#000";
      el.style.fontSize = `${
        (T.nFont || 16 / stageRect.height) * stageRect.height
      }px`;

      el.dataset.placeholder = TEXT_PLACEHOLDER;
      updatePlaceholderState(el, safeText);
      el.style.touchAction = "none";
      el.style.pointerEvents = "auto";
      initializeTextBoxElement(el);

      textLayer.appendChild(el);
      saveTextBox(el);
    }
  }

  // klik kosong pada textLayer untuk batal pilih
  textLayer.addEventListener("pointerdown", (e) => {
    if (e.target === textLayer) clearTextSelectionUI();
  });

  function saveTextBox(el) {
    const id = el.dataset.id;
    if (!id) return;
    const stage = pdfStage.getBoundingClientRect();
    const stageWidth = stage.width;
    const stageHeight = stage.height;
    if (!stageWidth || !stageHeight) return;
    const r = el.getBoundingClientRect();
    const pageMap = ensureTextMap(currentPageNum);
    const prev = pageMap.get(id);
    const fontPx = parseFloat(getComputedStyle(el).fontSize) || 16;
    const textValue = getBoxEditableText(el);
    const viewport = getViewportForPage(currentPageNum);
    const pdfQuad = computePdfQuad(viewport, stage, r);
    const pdfRectFromQuad = quadToRect(pdfQuad);
    const pdfRect = computePdfRect(viewport, stage, r);
    const fontPt = computePdfFontSize(viewport, stage, r, fontPx);

    pageMap.set(id, {
      nLeft: (r.left - stage.left) / stageWidth,
      nTop: (r.top - stage.top) / stageHeight,
      nWidth: r.width / stageWidth,
      nHeight: r.height / stageHeight,
      nFont: fontPx / stageHeight,
      color: rgbToHex(getComputedStyle(el).color) || "#000000",
      text: textValue,
      pdfRect: pdfRectFromQuad || pdfRect || prev?.pdfRect || null,
      pdfQuad: pdfQuad || prev?.pdfQuad || null,
      fontPt: fontPt || prev?.fontPt || null,
      rotation: viewport?.rotation ?? prev?.rotation ?? 0,
    });
    updatePlaceholderState(el, textValue);
    updateDownloadButtonState();
  }

  // Tambah teks baru
  addTextBtn?.addEventListener("click", () => {
    const stage = pdfStage.getBoundingClientRect();
    const id = newId();
    const color = textColorInp?.value || "#000000";
    const fontPx = +(textSizeInp?.value || 16);

    const el = document.createElement("div");
    el.className = "pdf-text-box";
    el.contentEditable = "true";
    el.dataset.id = id;
    el.textContent = "";
    el.style.left = "50px";
    el.style.top = "50px";
    el.style.width = "180px";
    el.style.height = "40px";
    el.style.color = color;
    el.style.fontSize = `${fontPx}px`;
    el.dataset.placeholder = TEXT_PLACEHOLDER;
    el.dataset.empty = "1";

    initializeTextBoxElement(el);

    textLayer.appendChild(el);
    selectTextEl(el);
    saveTextBox(el);
  });

  // Hapus teks terpilih
  removeTextBtn?.addEventListener("click", () => {
    if (!selectedTextId) return;
    const map = ensureTextMap(currentPageNum);
    map.delete(selectedTextId);
    const el = [...textLayer.children].find(
      (n) => n.dataset?.id === selectedTextId
    );
    if (el) el.remove();
    clearTextSelectionUI();
    updateDownloadButtonState();
  });

  // Sinkron control -> box terpilih
  textColorInp?.addEventListener("input", () => {
    const el = getSelectedTextEl();
    if (!el) return;
    el.style.color = textColorInp.value;
    saveTextBox(el);
  });
  textSizeInp?.addEventListener("input", () => {
    const el = getSelectedTextEl();
    if (!el) return;
    const px = +textSizeInp.value || 16;
    el.style.fontSize = `${px}px`;
    saveTextBox(el);
  });

  // Delete/backspace: jangan ganggu saat lagi mengetik
  window.addEventListener("keydown", (e) => {
    const tag = (e.target && e.target.tagName) || "";
    const isEditing = document.activeElement?.isContentEditable;
    if (tag === "INPUT" || tag === "TEXTAREA" || isEditing) return;
    if ((e.key === "Delete" || e.key === "Backspace") && selectedTextId) {
      e.preventDefault();
      removeTextBtn?.click();
    }
  });

  // ---------- Download (signature + text) ----------
  function makeTimestampLabel() {
    const d = new Date(),
      pad = (n) => String(n).padStart(2, "0");
    const tzMinutes = -d.getTimezoneOffset();
    let tz = `UTC${tzMinutes >= 0 ? "+" : ""}${tzMinutes / 60}`;
    if (tzMinutes === 420) tz = "WIB";
    else if (tzMinutes === 480) tz = "WITA";
    else if (tzMinutes === 540) tz = "WIT";
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(
      d.getHours()
    )}${pad(d.getMinutes())}${pad(d.getSeconds())}-${tz}`;
  }

  // Bungkus teks sesuai lebar box saat draw ke PDF
  function drawWrappedText(page, font, rgbFn, T, pageW, pageH) {
    const pad = 2;
    const sizePt = Math.max(T.fontPt || (T.nFont || 0.00002) * pageH, 0.0001);
    const col = hexToRgb01(T.color || "#000000");
    const color = rgbFn(col.r, col.g, col.b);

    const quad = T.pdfQuad;
    let origin;
    let xVec;
    let yVec;
    let boxWidth;
    let boxHeight;
    if (quad && quad.tl && quad.tr && quad.bl) {
      origin = quad.tl;
      xVec = {
        x: quad.tr.x - quad.tl.x,
        y: quad.tr.y - quad.tl.y,
      };
      yVec = {
        x: quad.bl.x - quad.tl.x,
        y: quad.bl.y - quad.tl.y,
      };
      boxWidth = vectorLength(xVec);
      boxHeight = vectorLength(yVec);
    } else {
      origin = {
        x: T.nLeft * pageW,
        y: pageH - T.nTop * pageH,
      };
      boxWidth = Math.max(1, T.nWidth * pageW);
      boxHeight = Math.max(1, T.nHeight * pageH);
      xVec = { x: boxWidth, y: 0 };
      yVec = { x: 0, y: -boxHeight };
    }
    boxWidth = Math.max(boxWidth, 1);
    boxHeight = Math.max(boxHeight, 1);
    const angle =
      Math.atan2(xVec.y, xVec.x) || 0; /* orientasi baseline (TL -> TR) */
    const maxW = Math.max(10, boxWidth - pad * 2);

    const raw = (T.text || "").replace(/\r/g, "");
    const paragraphs = raw.split(/\n/);

    const mapPoint = (localX, localY) => {
      const fx = localX / boxWidth;
      const fy = localY / boxHeight;
      return {
        x: origin.x + xVec.x * fx + yVec.x * fy,
        y: origin.y + xVec.y * fx + yVec.y * fy,
      };
    };

    let cursorY = pad + sizePt;
    const lineStep = sizePt * 1.2;

    for (const para of paragraphs) {
      if (!para) {
        cursorY += lineStep;
        continue;
      }
      const words = para.split(/\s+/);
      let line = "";
      for (const w of words) {
        const test = line ? line + " " + w : w;
        const width = font.widthOfTextAtSize(test, sizePt);
        if (width <= maxW) {
          line = test;
        } else {
          if (line) {
            const start = mapPoint(pad, cursorY);
            page.drawText(line, {
              x: start.x,
              y: start.y,
              size: sizePt,
              font,
              color,
              rotate: PDFLib.degrees((angle * 180) / Math.PI),
            });
            cursorY += lineStep;
          }
          const ww = font.widthOfTextAtSize(w, sizePt);
          if (ww > maxW) {
            const start = mapPoint(pad, cursorY);
            page.drawText(w, {
              x: start.x,
              y: start.y,
              size: sizePt,
              font,
              color,
              rotate: PDFLib.degrees((angle * 180) / Math.PI),
            });
            cursorY += lineStep;
            line = "";
          } else {
            line = w;
          }
        }
      }
      if (line) {
        const start = mapPoint(pad, cursorY);
        page.drawText(line, {
          x: start.x,
          y: start.y,
          size: sizePt,
          font,
          color,
          rotate: PDFLib.degrees((angle * 180) / Math.PI),
        });
        cursorY += lineStep;
      }
    }
  }

  downloadSignedPdfBtn.addEventListener("click", async () => {
    const hasSig = placements.size > 0;
    const hasTxt = [...textItems.values()].some((m) => m.size > 0);
    if (!hasSig && !hasTxt) {
      void Swal.fire("Tunggu!", "Belum ada tanda tangan atau teks.", "info");
      return;
    }

    loadingSpinner.style.display = "flex";
    try {
      const { PDFDocument, StandardFonts, rgb } = PDFLib;
      const pdfDocToModify = await PDFDocument.load(originalPdfBytes);
      const pages = pdfDocToModify.getPages();
      const helvetica = await pdfDocToModify.embedFont(StandardFonts.Helvetica);

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i],
          pageNum = i + 1;
        const pageW = page.getWidth(),
          pageH = page.getHeight();

        const s = placements.get(pageNum);
        if (s) {
          const img = await pdfDocToModify.embedPng(s.pngBytes);
          const quad = s.pdfQuad;
          if (quad && quad.bl && quad.br && quad.tl) {
            const origin = quad.bl;
            const xVec = {
              x: quad.br.x - quad.bl.x,
              y: quad.br.y - quad.bl.y,
            };
            const yVec = {
              x: quad.tl.x - quad.bl.x,
              y: quad.tl.y - quad.bl.y,
            };
            const widthLen = Math.max(1, vectorLength(xVec));
            const heightLen = Math.max(1, vectorLength(yVec));
            const angle = Math.atan2(xVec.y, xVec.x);
            page.drawImage(img, {
              x: origin.x,
              y: origin.y,
              width: widthLen,
              height: heightLen,
              rotate: PDFLib.degrees((angle * 180) / Math.PI),
            });
          } else {
            let x;
            let y;
            let w;
            let h;
            let rect = s.pdfRect;
            if (!rect || rect.width <= 0 || rect.height <= 0) {
              const viewport = pageViewportMap.get(pageNum);
              const computed = normalizedRectToPdfRect(s, viewport);
              if (computed) rect = computed;
            }
            if (rect && rect.width > 0 && rect.height > 0) {
              ({ x, y, width: w, height: h } = rect);
            } else {
              w = s.nWidth * pageW;
              h = s.nHeight * pageH;
              x = s.nLeft * pageW;
              y = pageH - s.nTop * pageH - h;
            }
            page.drawImage(img, { x, y, width: w, height: h });
          }
        }

        const tmap = textItems.get(pageNum);
        if (tmap) {
          const viewport = pageViewportMap.get(pageNum);
          for (const T of tmap.values()) {
            if (
              viewport &&
              (!T.pdfRect || T.pdfRect.width <= 0 || T.pdfRect.height <= 0)
            ) {
              const rect = normalizedRectToPdfRect(T, viewport);
              if (rect) T.pdfRect = rect;
            }
            if (viewport && (!T.fontPt || T.fontPt <= 0)) {
              const fontPt = normalizedFontToPdf(T, viewport);
              if (fontPt) T.fontPt = fontPt;
            }
            drawWrappedText(page, helvetica, rgb, T, pageW, pageH);
          }
        }
      }

      const pdfBytes = await pdfDocToModify.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const base = (pdfFile?.name || "document.pdf").replace(/\.pdf$/i, "");
      a.download = `${base}-filled-${makeTimestampLabel()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      void Swal.fire("Error", "Terjadi kesalahan saat menyimpan PDF.", "error");
    } finally {
      loadingSpinner.style.display = "none";
    }
  });

  // ---------- Reset & init ----------
  function resetToUploadView() {
    uploadView.classList.remove("hidden");
    mainView.classList.add("hidden");
    pdfDoc = null;
    originalPdfBytes = null;
    pdfFile = null;
    clearSignature();
    sigDragContainer.classList.add("hidden");
    placements.clear();
    textItems.clear();
    pageViewportMap.clear();
    currentViewport = null;
    textLayer.innerHTML = "";
    selectedTextId = null;
    uploadInput.value = "";
    pdfViewerContainer.style.alignItems = "";
    updatePageButtons();
    updateDownloadButtonState();
  }

  resetBtn.addEventListener("click", resetToUploadView);
  uploadInput.addEventListener("change", (e) =>
    handleFileSelect(e.target.files[0])
  );

  ["dragenter", "dragover", "dragleave", "drop"].forEach((ev) => {
    uploadArea.addEventListener(
      ev,
      (e) => {
        e.preventDefault();
        e.stopPropagation();
      },
      false
    );
  });
  ["dragenter", "dragover"].forEach((ev) =>
    uploadArea.addEventListener(
      ev,
      () => uploadArea.classList.add("highlight"),
      false
    )
  );
  ["dragleave", "drop"].forEach((ev) =>
    uploadArea.addEventListener(
      ev,
      () => uploadArea.classList.remove("highlight"),
      false
    )
  );
  uploadArea.addEventListener(
    "drop",
    (e) => handleFileSelect(e.dataTransfer.files[0]),
    false
  );

  // Signature pad listeners
  sigPadCanvas.addEventListener("mousedown", startDrawing);
  sigPadCanvas.addEventListener("mousemove", draw);
  sigPadCanvas.addEventListener("mouseup", stopDrawing);
  sigPadCanvas.addEventListener("mouseleave", stopDrawing);
  sigPadCanvas.addEventListener("touchstart", startDrawing, { passive: false });
  sigPadCanvas.addEventListener("touchmove", draw, { passive: false });
  sigPadCanvas.addEventListener("touchend", stopDrawing);
  clearSigBtn.addEventListener("click", clearSignature);

  // Controls sync -> selection
  textColorInp?.addEventListener("change", () => {
    const el = getSelectedTextEl();
    if (el) {
      el.style.color = textColorInp.value;
      saveTextBox(el);
    }
  });
  textSizeInp?.addEventListener("change", () => {
    const el = getSelectedTextEl();
    if (el) {
      el.style.fontSize = `${+textSizeInp.value || 16}px`;
      saveTextBox(el);
    }
  });

  placeSigBtn.disabled = true;
  resizeSigPad();
  window.addEventListener("resize", () => {
    resizeSigPad();
    if (pdfDoc) void renderPage(currentPageNum);
    updateVerticalCentering();
  });
  new ResizeObserver(() => updateVerticalCentering()).observe(
    pdfViewerContainer
  );
  new ResizeObserver(() => updateVerticalCentering()).observe(pdfStage);
  const themeObserver = new MutationObserver((m) => {
    for (const x of m) if (x.attributeName === "data-theme") resizeSigPad();
  });
  themeObserver.observe(document.documentElement, { attributes: true });
}
