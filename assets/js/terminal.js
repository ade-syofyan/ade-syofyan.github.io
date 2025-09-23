// js/terminal.js

function initializeTerminal() {
  const terminal = document.getElementById("terminal");
  if (!terminal) return;

  const terminalWindow = document.getElementById("terminal-window");
  const terminalOutput = document.getElementById("terminal-output");
  const terminalInput = document.getElementById("terminal-input");
  const terminalPrompt = document.querySelector(
    "#terminal-window .flex-shrink-0 span"
  );
  const terminalToggleBtn = document.getElementById("terminal-toggle-btn");
  const terminalCloseBtn = document.getElementById("terminal-close");
  const terminalMinimizeBtn = document.getElementById("terminal-minimize");
  const terminalMaximizeBtn = document.getElementById("terminal-maximize");

  let commandHistory = [];
  let historyIndex = 0;
  let currentPath = [];
  let chatMode = false; // State untuk mode chat
  // State untuk konfirmasi perintah berbahaya
  let isAwaitingConfirmation = false;
  let confirmationCallback = null;

  const getCurrentDirectory = () => {
    let current = fileSystem;
    for (const dir of currentPath) {
      current = current[dir + "/"];
    }
    return current;
  };

  const updatePrompt = () => {
    if (chatMode) {
      terminalPrompt.textContent = `chat> `;
      return;
    }
    const pathString =
      currentPath.length > 0 ? `~/${currentPath.join("/")}` : "~";
    if (terminalPrompt) {
      terminalPrompt.textContent = `guest@ade-syofyan.dev:${pathString}$ `;
    }
  };

  const escapeHtml = (unsafe) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const printToTerminal = (text, isCommand = false) => {
    const line = document.createElement("div");
    line.className = "terminal-line";
    if (isCommand) {
      const currentPrompt = chatMode
        ? `chat> `
        : `guest@ade-syofyan.dev:${
            currentPath.length > 0 ? `~/${currentPath.join("/")}` : "~"
          }$ `;

      line.innerHTML = `<span style="color: var(--terminal-prompt-color);">${currentPrompt}</span><span style="color: var(--text-white);">${escapeHtml(
        text
      )}</span>`;
    } else {
      line.innerHTML = text;
    }
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  };

  // Fungsi untuk menampilkan teks dengan efek mengetik di terminal
  const typeTerminalMessage = (element, text, delay = 20) => {
    // Batalkan proses mengetik sebelumnya jika ada
    if (activeTypingAbortController) {
      activeTypingAbortController.abort();
    }

    const controller = new AbortController();
    activeTypingAbortController = controller;

    let i = 0;
    element.innerHTML = ""; // Pastikan elemen kosong sebelum mengetik
    function typing() {
      if (controller.signal.aborted) {
        // Jika dibatalkan, tampilkan sisa teks secara instan
        element.innerHTML += text.substring(i).replace(/<[^>]*>?/gm, "");
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        activeTypingAbortController = null;
        return;
      }

      if (i < text.length) {
        // Tangani tag HTML agar tidak diketik karakter demi karakter
        if (text.charAt(i) === "<") {
          const tagEndIndex = text.indexOf(">", i);
          if (tagEndIndex !== -1) {
            element.innerHTML += text.substring(i, tagEndIndex + 1);
            i = tagEndIndex + 1;
            setTimeout(typing, 0); // Lanjutkan segera
            return;
          }
        }
        element.innerHTML += text.charAt(i);
        i++;
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        setTimeout(typing, delay);
      }
    }
    typing();
  };

  const fullResetTerminal = () => {
    terminalOutput.innerHTML = "";
    commandHistory = [];
    historyIndex = 0;
    currentPath = [];
    chatMode = false;
    updatePrompt();
    printToTerminal("Selamat datang di Terminal Portofolio Ade Syofyan!");
    printToTerminal(
      "Ketik `help` untuk melihat daftar perintah yang tersedia."
    );
    printToTerminal("");
  };

  const commands = {
    help: "Perintah yang tersedia: <br> `help`   - Menampilkan bantuan ini <br> `neofetch` - Menampilkan info profil dengan gaya <br> `cowsay &lt;pesan&gt;` - Menampilkan pesan dengan gaya sapi <br> `ls`     - Menampilkan isi direktori <br> `cat &lt;file&gt;` - Membaca isi file <br> `cd &lt;dir&gt;` - Pindah direktori <br> `chat`   - Memulai mode percakapan dengan AI <br> `about`  - Menampilkan info tentang saya <br> `skills` - Menampilkan daftar keahlian <br> `contact` - Menampilkan info kontak <br> `social` - Menampilkan link media sosial <br> `achievements` - Menampilkan daftar pencapaian <br> `open &lt;arg&gt;` - Membuka link (e.g., `open linkedin`) <br> `goto &lt;arg&gt;` - Navigasi ke bagian (e.g., `goto skills`) <br> `clear`  - Membersihkan layar terminal <br> `exit`   - Menutup terminal <br> `reboot` - Merestart 'sistem' (easter egg) <br> `format c:` - Memformat 'drive' (easter egg)",
    about:
      "Halo, saya Ade Syofyan. Seorang Mobile & Web Developer dengan pengalaman lebih dari 7 tahun.",
    skills:
      "Keahlian utama: Mobile (Flutter, Kotlin), Web (Laravel, PHP, JS), AI Integration, ERP Systems, Firebase. Baca `skills.json` untuk detail.",
    contact: `Email: ${siteConfig.email}, Telepon: ${siteConfig.phoneDisplay}`,
    social:
      "Anda bisa menemukan saya di: <br> - LinkedIn: `open linkedin` <br> - WhatsApp: `open whatsapp` <br> - CV: `open cv`",
    achievements: () => {
      const unlockedIds = JSON.parse(
        localStorage.getItem("portfolioAchievements") || "[]"
      );
      let output = "Daftar Pencapaian:<br>-------------------<br>";
      for (const id in window.achievements) {
        // Use window.achievements to be explicit
        const ach = window.achievements[id];
        output += `<span style="color: ${
          unlockedIds.includes(id) ? "var(--terminal-prompt-color)" : "inherit"
        }">[${unlockedIds.includes(id) ? "✓" : "✗"}] ${ach.name}:</span> ${
          unlockedIds.includes(id) ? ach.description : "???"
        }<br>`;
      }
      return output;
    },
    clear: () => {
      terminalOutput.innerHTML = "";
    },
    ls: () => {
      unlockAchievement("file_explorer");
      const currentDir = getCurrentDirectory();
      let output = Object.keys(currentDir)
        .map((item) =>
          item.endsWith("/")
            ? `<span class="text-blue-400">${item}</span>`
            : item
        )
        .join("  ");
      return output || "Direktori kosong.";
    },
    cat: (filename) => {
      if (!filename) return "Gunakan: `cat [nama-file]`";
      unlockAchievement("file_explorer");
      const currentDir = getCurrentDirectory();
      if (currentDir[filename] && typeof currentDir[filename] === "string") {
        return `<pre>${escapeHtml(currentDir[filename])}</pre>`;
      }
      return `cat: ${filename}: File tidak ditemukan`;
    },
    cd: (dirname) => {
      if (!dirname || dirname === "~") {
        currentPath = [];
      } else if (dirname === "..") {
        currentPath.pop();
      } else {
        const currentDir = getCurrentDirectory();
        const targetDir = dirname.endsWith("/") ? dirname : dirname + "/";
        if (
          currentDir[targetDir] &&
          typeof currentDir[targetDir] === "object"
        ) {
          currentPath.push(dirname.replace("/", ""));
        } else {
          return `cd: ${dirname}: Bukan direktori atau tidak ditemukan`;
        }
      }
      updatePrompt();
      return ""; // No output on success
    },
    exit: () => {
      minimizeTerminal(); // 'exit' should hide the terminal
    },
    goto: (section) => {
      const element = document.getElementById(section);
      if (element) {
        closeTerminal();
        setTimeout(() => element.scrollIntoView({ behavior: "smooth" }), 300);
        return `Navigasi ke bagian #${section}...`;
      }
      return `Error: Bagian #${section} tidak ditemukan. Gunakan: \`goto [nama-bagian]\``;
    },
    open: (target) => {
      const links = {
        linkedin: siteConfig.social.linkedin,
        whatsapp: siteConfig.social.whatsapp,
        cv: siteConfig.cvUrl,
      };
      if (target && links[target]) {
        if (target === "linkedin" || target === "whatsapp")
          unlockAchievement("social_butterfly");
        window.open(links[target], "_blank");
        return `Membuka ${target} di tab baru...`;
      }
      return `Error: Argumen tidak valid. Gunakan 'open [${Object.keys(
        links
      ).join(" | ")}]'.`;
    },
    chat: () => {
      chatMode = true;
      updatePrompt();
      return "Memasuki mode chat. Ketik `exit` untuk kembali ke terminal.";
    },
    neofetch: () => {
      unlockAchievement("geek_cred");
      const uptime = () => {
        const now = Date.now();
        const loadedAt = window.performance.timing.navigationStart;
        const duration = now - loadedAt;
        const seconds = Math.floor((duration / 1000) % 60);
        const minutes = Math.floor((duration / (1000 * 60)) % 60);
        const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
        return `${hours}h ${minutes}m ${seconds}s`;
      };

      const theme = localStorage.getItem("theme") || "system";
      const resolution = `${window.innerWidth}x${window.innerHeight}`;

      const asciiArt = `
<span class="neofetch-logo">       .--.
      |o_o |
      |:_/ |
     //   \\ \\
    (|     | )
   /'\\_   _/\`\\
   \\___)=(___/</span>`;

      const info = `
<span class="neofetch-title">${siteConfig.name}@portfolio</span>
-------------------
<span class="neofetch-label">OS</span>:         Portfolio OS v1.0
<span class="neofetch-label">Host</span>:       ${
        navigator.vendor || "User"
      } Browser
<span class="neofetch-label">Uptime</span>:     ${uptime()}
<span class="neofetch-label">Shell</span>:      port-sh
<span class="neofetch-label">Theme</span>:      ${theme}
<span class="neofetch-label">Skills</span>:     Mobile (Flutter), Web (Laravel), AI, ERP`;

      return `<pre class="neofetch-container">${asciiArt}${info}</pre>`;
    },
    cowsay: (...message) => {
      const msg = message.join(" ");
      if (!msg) {
        return "Gunakan: `cowsay [pesan]`";
      }

      const escapedMsg = escapeHtml(msg);
      const topBar = "_".repeat(escapedMsg.length + 2);
      const bottomBar = "-".repeat(escapedMsg.length + 2);

      const cow = `         \\   ^__^
          \\  (oo)\\_______
             (__)\\       )\\/\\
                 ||----w |
                 ||     ||`;

      const finalOutput = ` ${topBar}\n< ${escapedMsg} >\n ${bottomBar}\n${cow}`;

      return `<pre>${finalOutput}</pre>`;
    },

    // --- Easter Egg Commands ---
    _requestTerminalConfirmation: (message, onConfirm) => {
      printToTerminal(`${message} [y/n]`);
      isAwaitingConfirmation = true;
      confirmationCallback = onConfirm;
      terminalInput.focus();
      return "";
    },

    reboot: function () {
      return this._requestTerminalConfirmation(
        "Sistem ini akan di-reboot. Apakah Anda yakin?",
        () => window.triggerBSOD && window.triggerBSOD()
      );
    },

    format: function (drive) {
      if (drive && drive.toLowerCase() === "c:") {
        return this._requestTerminalConfirmation(
          "PERINGATAN: Semua data di 'drive C:' akan hilang. Lanjutkan?",
          () => window.triggerBSOD && window.triggerBSOD()
        );
      }
      return "Gunakan: `format c:`";
    },

    shutdown: function () {
      return this.reboot();
    },
    "rm -rf /": function () {
      return this.reboot();
    },
    "sudo rm -rf /": function () {
      return this.reboot();
    },
  };

  const handleTerminalChat = async (message) => {
    unlockAchievement("terminal_ai_chat"); // Buka achievement saat AI chat digunakan

    const typingIndicator = document.createElement("div");
    typingIndicator.className = "terminal-line";
    typingIndicator.innerHTML = `<span class="animate-pulse">AI sedang mengetik...</span>`; // Indikator mengetik
    terminalOutput.appendChild(typingIndicator);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;

    const outputCallback = (responseText, isError = false) => {
      // Hapus indikator mengetik setelah respons diterima
      terminalOutput.removeChild(typingIndicator);

      const aiResponseLine = document.createElement("div");
      aiResponseLine.className = "terminal-line";
      terminalOutput.appendChild(aiResponseLine);

      const formattedResponse = isError
        ? `<span style="color: #ef4444;">Error:</span> ${responseText}`
        : `<span style="color: var(--color-accent);">AI:</span> ${responseText}`;

      typeTerminalMessage(aiResponseLine, formattedResponse); // Tampilkan respons dengan efek mengetik
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    };

    await window.getTerminalChatResponse(message, outputCallback);
  };

  const processCommand = (command) => {
    const originalCommand = command.trim();
    printToTerminal(originalCommand, true);

    if (isAwaitingConfirmation) {
      isAwaitingConfirmation = false;
      if (originalCommand.toLowerCase() === "y") {
        // Sembunyikan keyboard virtual dengan menghilangkan fokus dari input
        terminalInput.blur();

        // 1. Tutup (sembunyikan) terminal terlebih dahulu
        terminal.classList.add("hidden");
        terminalWindow.classList.remove("maximized");

        // 2. Jalankan callback (trigger BSOD) setelah jeda singkat
        if (confirmationCallback) {
          setTimeout(confirmationCallback, 200); // Jeda 200ms untuk transisi visual
        }

        // 3. Reset state terminal untuk penggunaan berikutnya
        fullResetTerminal();
      } else {
        printToTerminal("Aksi dibatalkan.");
      }
      confirmationCallback = null;
      let activeTypingAbortController = null;

      return;
    }

    // Khusus untuk perintah berbahaya yang mengandung spasi
    const lowerCaseCommand = originalCommand.toLowerCase();
    if (
      lowerCaseCommand === "rm -rf /" ||
      lowerCaseCommand === "sudo rm -rf /"
    ) {
      commands[lowerCaseCommand]();
      return;
    }

    if (chatMode) {
      if (originalCommand.toLowerCase() === "exit") {
        chatMode = false;
        updatePrompt();
        printToTerminal("Keluar dari mode chat.");
      } else {
        handleTerminalChat(originalCommand);
      }
      return;
    }

    let cmd;
    let args;

    // Modifikasi cara memproses perintah untuk menangani "format c:"
    if (originalCommand.toLowerCase().startsWith("format c:")) {
      cmd = "format";
      args = ["c:"];
    } else {
      const parts = originalCommand.split(" ");
      cmd = parts[0].toLowerCase();
      args = parts.slice(1);
    }

    const result = commands[cmd];
    unlockAchievement("terminal_velocity");
    if (typeof result === "function") {
      // Gunakan .apply() untuk menjaga konteks 'this' ke objek 'commands'
      const output = result.apply(commands, args);
      if (output) printToTerminal(output);
    } else if (result && args.length === 0) {
      printToTerminal(result);
    } else {
      const currentDir = getCurrentDirectory();
      if (
        currentDir[originalCommand] &&
        typeof currentDir[originalCommand] === "string"
      ) {
        printToTerminal(
          `Perintah tidak ditemukan: ${originalCommand}.<br>Untuk membaca file, gunakan: \`cat ${originalCommand}\``
        );
      } else {
        printToTerminal(
          `Perintah tidak ditemukan: ${originalCommand}. Ketik 'help' untuk daftar perintah.`
        );
      }
    }
  };

  const openTerminal = () => {
    terminal.classList.remove("hidden");
    terminalInput.focus();
  };
  const closeTerminal = () => {
    // Repurposed: Close button now RESETS and HIDES the terminal
    fullResetTerminal();
    terminal.classList.add("hidden");
    terminalWindow.classList.remove("maximized");
  };
  const minimizeTerminal = () => {
    // Minimize button HIDES the terminal
    terminal.classList.add("hidden");
    terminalWindow.classList.remove("maximized");
  };

  window.minimizeTerminal = minimizeTerminal;

  terminalInput.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      printToTerminal(terminalInput.value + "^C", true);
      terminalInput.value = "";

      if (isAwaitingConfirmation) {
        isAwaitingConfirmation = false;
        confirmationCallback = null;
        printToTerminal("Aksi dibatalkan.");
      } else if (activeTypingAbortController) {
        // Hentikan efek mengetik AI
        activeTypingAbortController.abort();
        activeTypingAbortController = null;
        // Hapus indikator "sedang mengetik" jika masih ada
        const typingIndicator = terminalOutput.querySelector(".animate-pulse");
        if (
          typingIndicator &&
          typingIndicator.parentElement.parentElement === terminalOutput
        ) {
          terminalOutput.removeChild(typingIndicator.parentElement);
        }
      }
      // Fokus kembali ke input setelah membatalkan
      terminalInput.focus();
      return;
    }

    if (e.key === "Enter") {
      const command = terminalInput.value.trim();
      if (command) {
        if (commandHistory[commandHistory.length - 1] !== command)
          commandHistory.push(command);
        historyIndex = commandHistory.length;
        processCommand(command);
      }
      terminalInput.value = "";
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        terminalInput.value = commandHistory[historyIndex];
        setTimeout(
          () =>
            terminalInput.setSelectionRange(
              terminalInput.value.length,
              terminalInput.value.length
            ),
          0
        );
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        terminalInput.value = commandHistory[historyIndex];
        setTimeout(
          () =>
            terminalInput.setSelectionRange(
              terminalInput.value.length,
              terminalInput.value.length
            ),
          0
        );
      } else {
        historyIndex = commandHistory.length;
        terminalInput.value = "";
      }
    }
  });

  terminalToggleBtn.addEventListener("click", openTerminal);
  terminalCloseBtn.addEventListener("click", closeTerminal);
  terminalMinimizeBtn.addEventListener("click", minimizeTerminal);
  terminalMaximizeBtn.addEventListener("click", () =>
    terminalWindow.classList.toggle("maximized")
  );

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !terminal.classList.contains("hidden"))
      closeTerminal();
    if (e.key === "`" && !["INPUT", "TEXTAREA"].includes(e.target.tagName)) {
      terminal.classList.contains("hidden") ? openTerminal() : closeTerminal();
    }
  });

  updatePrompt();
  fullResetTerminal(); // Initial setup
}
