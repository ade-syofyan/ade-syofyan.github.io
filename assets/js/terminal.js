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

  const getCurrentDirectory = () => {
    let current = fileSystem;
    for (const dir of currentPath) {
      current = current[dir + "/"];
    }
    return current;
  };

  const updatePrompt = () => {
    const pathString =
      currentPath.length > 0 ? `~/${currentPath.join("/")}` : "~";
    if (terminalPrompt) {
      terminalPrompt.textContent = `guest@ade-syofyan.dev:${pathString}$`;
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
      line.innerHTML = `<span style="color: var(--terminal-prompt-color);">guest@ade-syofyan.dev:~$</span> <span style="color: var(--text-white);">${escapeHtml(
        text
      )}</span>`;
    } else {
      line.innerHTML = text;
    }
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  };

  const resetTerminal = () => {
    terminalOutput.innerHTML = "";
    printToTerminal("Selamat datang di Terminal Portofolio Ade Syofyan!");
    printToTerminal(
      "Ketik `help` untuk melihat daftar perintah yang tersedia."
    );
    printToTerminal("");
  };

  const commands = {
    help: "Perintah yang tersedia: <br> `help`   - Menampilkan bantuan ini <br> `ls`     - Menampilkan isi direktori <br> `cat <file>` - Membaca isi file <br> `cd <dir>` - Pindah direktori <br> `about`  - Menampilkan info tentang saya <br> `skills` - Menampilkan daftar keahlian <br> `contact` - Menampilkan info kontak <br> `social` - Menampilkan link media sosial <br> `achievements` - Menampilkan daftar pencapaian <br> `open <arg>` - Membuka link (e.g., `open linkedin`) <br> `goto <arg>` - Navigasi ke bagian (e.g., `goto skills`) <br> `clear`  - Membersihkan layar terminal <br> `exit`   - Menutup terminal",
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
      for (const id in achievements) {
        const ach = achievements[id];
        output += `<span style="color: ${
          unlockedIds.includes(id) ? "var(--terminal-prompt-color)" : "inherit"
        }">[${unlockedIds.includes(id) ? "✓" : "✗"}] ${ach.name}:</span> ${
          unlockedIds.includes(id) ? ach.description : "???"
        }<br>`;
      }
      return output;
    },
    clear: () => {
      resetTerminal();
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
      closeTerminal();
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
  };

  const processCommand = (command) => {
    const originalCommand = command.trim();
    printToTerminal(originalCommand, true);
    const parts = originalCommand.split(" ");
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    const result = commands[cmd];

    unlockAchievement("terminal_velocity");
    if (typeof result === "function") {
      const output = result(...args);
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
    terminal.classList.add("hidden");
    terminalWindow.classList.remove("maximized");
  };
  const minimizeTerminal = () => {
    terminal.classList.add("hidden");
    terminalWindow.classList.remove("maximized");
  };

  terminalInput.addEventListener("keydown", (e) => {
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
  resetTerminal();
}
