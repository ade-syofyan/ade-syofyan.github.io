function initializeCaseStudyGenerator() {
  const modal = document.getElementById("caseStudyModal");
  const modalBody = document.getElementById("caseStudyBody");
  const downloadBtn = document.getElementById("downloadCaseStudyPdfBtn");

  if (!modal || !modalBody || !downloadBtn) return;

  let caseStudyConversation = [];

  window.generateCaseStudy = async (topic) => {
    const modalTitle = document.getElementById("caseStudyTitle");

    // 1. Tampilkan Modal dengan status Loading
    modalTitle.textContent = `Studi Kasus: Sektor ${
      topic.charAt(0).toUpperCase() + topic.slice(1)
    }`;
    modalBody.innerHTML = `
      <div id="case-study-content-area">
        <div class="flex flex-col items-center justify-center gap-4 py-8">
          <i data-lucide="loader" class="w-12 h-12 animate-spin text-accent"></i>
          <p class="text-lg" style="color: var(--text-secondary);">Menganalisis proyek dan menghasilkan studi kasus untuk Anda...</p>
        </div>
      </div>
      <div id="case-study-chat-history" class="mt-4 space-y-4 flex flex-col"></div>
      <div id="case-study-chat-input-container" class="mt-6 hidden">
        <p class="text-sm font-semibold mb-2" style="color: var(--text-secondary);">Punya pertanyaan lebih lanjut tentang studi kasus ini?</p>
        <div class="flex items-center gap-2">
          <input type="text" id="case-study-chat-input" class="form-input !py-2 !pl-3 text-sm flex-grow" placeholder="Tanyakan di sini...">
          <button id="case-study-chat-send" class="btn-secondary !py-2 !px-3"><i data-lucide="send" class="w-4 h-4"></i></button>
        </div>
      </div>
    `;
    lucide.createIcons();
    modal.classList.add("open");
    lockBodyScroll();

    // 2. Siapkan Prompt untuk AI
    const initialPrompt = createCaseStudyPrompt(topic);

    try {
      // 3. Panggil API Gemini
      const initialResponse = await callGemini(initialPrompt);

      // Inisialisasi riwayat percakapan studi kasus
      caseStudyConversation = [
        { role: "user", parts: [{ text: initialPrompt }] },
        { role: "model", parts: [{ text: initialResponse }] },
      ];

      // 4. Render hasil ke modal
      renderCaseStudyContent(initialResponse, modalBody);
      setupDeepDiveChat();
    } catch (error) {
      console.error("Error generating case study:", error);
      modalBody.innerHTML = `
        <div class="text-center py-8">
          <i data-lucide="server-crash" class="w-12 h-12 text-red-500 mx-auto mb-4"></i>
          <h4 class="text-xl font-bold" style="color: var(--text-white);">Gagal Menghasilkan Studi Kasus</h4>
          <p style="color: var(--text-secondary);">Maaf, terjadi kesalahan saat berkomunikasi dengan AI. Silakan coba lagi nanti.</p>
        </div>
      `;
      lucide.createIcons();
    }
  };

  // Fungsi untuk memanggil Gemini API
  async function callGemini(prompt, history = []) {
    const apiKey = typeof API_KEY !== "undefined" ? API_KEY : "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [...history, { role: "user", parts: [{ text: prompt }] }],
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    if (!result.candidates || !result.candidates[0].content) {
      throw new Error("Invalid response structure from API");
    }
    return result.candidates[0].content.parts[0].text;
  }

  // Fungsi untuk membuat prompt awal
  function createCaseStudyPrompt(topic) {
    const relevantProjects = projectsData
      .filter(
        (p) =>
          p.category.toLowerCase() === topic ||
          p.title.toLowerCase().includes(topic) ||
          p.type.toLowerCase().includes(topic)
      )
      .map((p) => ({
        title: p.title,
        goal: p.goal,
        process: p.process,
        impact: p.impact,
        techStack: p.techStack.map((t) => t.name).join(", "),
      }));

    const projectContext =
      relevantProjects.length > 0
        ? JSON.stringify(relevantProjects)
        : "Tidak ada data proyek spesifik untuk topik ini, namun jelaskan pendekatan umum Anda.";

    return `
      Anda adalah Ade Syofyan, seorang Programmer Senior.
      Tugas Anda adalah membuat sebuah studi kasus singkat dan profesional dalam Bahasa Indonesia tentang pengalaman Anda di sektor "${topic}".
      Gunakan data proyek berikut sebagai referensi utama: ${projectContext}.

      Struktur respons Anda HARUS dalam format HTML, dengan elemen-elemen berikut:
      1. Sebuah paragraf pembuka yang menarik.
      2. Section "Tantangan Klien" menggunakan <h4> dan <p>. Jelaskan masalah umum yang dihadapi klien di sektor ini.
      3. Section "Solusi Strategis Saya" menggunakan <h4> dan <ul> dengan <li>. Jelaskan pendekatan dan solusi yang Anda terapkan.
      4. Section "Teknologi yang Digunakan" menggunakan <h4> dan <p>. Sebutkan teknologi relevan dari data proyek.
      5. Section "Hasil & Dampak" menggunakan <h4> dan <p>. Jelaskan dampak positif dari solusi Anda.

      Gaya penulisan harus percaya diri, profesional, dan fokus pada pemecahan masalah.
      Gunakan tag <strong> untuk menyorot poin-poin penting.
    `;
  }

  // Fungsi untuk merender konten HTML ke modal
  function renderCaseStudyContent(htmlContent, container) {
    const contentArea = container.querySelector("#case-study-content-area");
    contentArea.innerHTML = htmlContent;
    contentArea.querySelectorAll("h4").forEach((h4) => {
      h4.classList.add("project-detail-heading");
      const iconMap = {
        tantangan: "shield-alert",
        solusi: "lightbulb",
        teknologi: "cpu",
        hasil: "trending-up",
      };
      const key = h4.textContent.split(" ")[0].toLowerCase();
      h4.innerHTML = `<i data-lucide="${iconMap[key] || "check-circle"}"></i> ${
        h4.innerHTML
      }`;
    });
    contentArea
      .querySelectorAll("p, li")
      .forEach((el) => (el.style.color = "var(--text-secondary)"));
    contentArea.querySelectorAll("ul").forEach((ul) => {
      ul.classList.add("list-disc", "list-inside", "space-y-2");
    });
    lucide.createIcons();
  }

  // Fungsi untuk mengaktifkan chat "Deep Dive"
  function setupDeepDiveChat() {
    const chatInputContainer = document.getElementById(
      "case-study-chat-input-container"
    );
    const chatInput = document.getElementById("case-study-chat-input");
    const sendBtn = document.getElementById("case-study-chat-send");
    const chatHistoryContainer = document.getElementById(
      "case-study-chat-history"
    );

    chatInputContainer.classList.remove("hidden");
    chatInput.focus();

    const handleSend = async () => {
      const userMessage = chatInput.value.trim();
      if (!userMessage) return;

      // Tampilkan pesan pengguna
      appendChatMessage(userMessage, "user", chatHistoryContainer);
      chatInput.value = "";

      // Tampilkan indikator loading
      const loadingEl = appendChatMessage(
        "...",
        "loading",
        chatHistoryContainer
      );

      try {
        const deepDivePrompt = `
          Konteks: Anda sedang melanjutkan diskusi tentang studi kasus yang baru saja Anda presentasikan.
          Pertanyaan baru dari pengguna: "${userMessage}"

          Jawab pertanyaan tersebut secara singkat dan relevan dengan konteks studi kasus. Tetaplah dalam peran sebagai Ade Syofyan.
        `;

        const aiResponse = await callGemini(
          deepDivePrompt,
          caseStudyConversation
        );

        // Update riwayat dan UI
        caseStudyConversation.push({
          role: "user",
          parts: [{ text: userMessage }],
        });
        caseStudyConversation.push({
          role: "model",
          parts: [{ text: aiResponse }],
        });
        loadingEl.remove();
        appendChatMessage(aiResponse, "ai", chatHistoryContainer);
      } catch (error) {
        console.error("Error in deep dive chat:", error);
        loadingEl.remove();
        appendChatMessage(
          "Maaf, terjadi kesalahan saat memproses pertanyaan Anda.",
          "error",
          chatHistoryContainer
        );
      }
    };

    sendBtn.onclick = handleSend;
    chatInput.onkeypress = (e) => {
      if (e.key === "Enter") handleSend();
    };
  }

  function appendChatMessage(message, type, container) {
    const bubble = document.createElement("div");
    let content = message;

    switch (type) {
      case "loading":
        bubble.className = "chat-bubble ai animate-pulse";
        content = "Mengetik...";
        break;
      case "error":
        bubble.className = "chat-bubble ai !bg-red-500/20 !text-red-400";
        break;
      default: // 'user' or 'ai'
        bubble.className = `chat-bubble ${type}`;
        if (type === "ai") {
          content = message.replace(
            /\*\*(.*?)\*\*/g,
            '<strong class="font-semibold text-accent">$1</strong>'
          );
        }
        break;
    }

    bubble.innerHTML = content;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
    return bubble;
  }

  // Fungsi untuk download PDF
  downloadBtn.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const caseStudyContent = modalBody.querySelector(
      "#case-study-content-area"
    );
    const title = document.getElementById("caseStudyTitle").textContent;

    html2canvas(caseStudyContent, {
      backgroundColor:
        getComputedStyle(document.documentElement)
          .getPropertyValue("--bg-card")
          .trim() || "#2d3748",
      scale: 2,
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      const margin = 10;
      pdf.addImage(
        imgData,
        "PNG",
        margin,
        margin,
        pdfWidth - margin * 2,
        pdfHeight > 277 ? 277 : pdfHeight
      );
      pdf.save(`${title.replace(/ /g, "_").toLowerCase()}.pdf`);
    });
  });
}

initializeCaseStudyGenerator();
