// js/chatbot.js

let conversationHistory = [];

function initializeChatbot() {
  const chatbotModal = document.getElementById("chatbotModal");
  if (!chatbotModal) return;

  const chatDisplay = document.getElementById("chatDisplay");
  const chatInput = document.getElementById("chatInput");

  window.openChatbotModal = function () {
    chatbotModal.classList.add("open");
    document.body.classList.add("modal-open");
    chatInput.focus();
    loadChatHistory();
    if (chatDisplay.children.length <= 1) {
      addQuickOptions();
    }
  };

  window.actuallyCloseChatbot = function () {
    chatbotModal.classList.remove("open");
    document.body.classList.remove("modal-open");
  };

  window.closeChatbotModal = function () {
    const hasUserInteracted = chatDisplay.querySelector(".flex.justify-end");
    if (!hasUserInteracted) {
      window.actuallyCloseChatbot();
    } else {
      showCustomConfirm(
        "Simpan sesi chat ini?",
        () => {
          saveChatHistory();
          window.actuallyCloseChatbot();
        },
        () => {
          deleteChatHistory();
          window.actuallyCloseChatbot();
        },
        "Simpan",
        "Jangan Simpan"
      );
    }
  };

  chatbotModal.addEventListener("click", (e) => {
    if (e.target === chatbotModal) closeChatbotModal();
  });

  chatInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendChatMessage();
    }
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function addQuickOptions() {
  const chatDisplay = document.getElementById("chatDisplay");
  const selectedOptions = shuffleArray([...allQuickChatOptions]).slice(0, 3);

  const quickOptionsDiv = document.createElement("div");
  quickOptionsDiv.className = "flex flex-wrap gap-2 mt-2 mb-2 justify-start";
  selectedOptions.forEach((optionText) => {
    const button = document.createElement("button");
    button.className = "text-sm py-1 px-3 rounded-full transition-colors";
    button.style =
      "background-color: var(--bg-card-secondary); color: var(--text-secondary);";
    button.textContent = optionText;
    button.onclick = () => {
      document.getElementById("chatInput").value = optionText;
      sendChatMessage();
      if (quickOptionsDiv.parentNode) {
        quickOptionsDiv.parentNode.removeChild(quickOptionsDiv);
      }
    };
    quickOptionsDiv.appendChild(button);
  });
  chatDisplay.appendChild(quickOptionsDiv);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

function analyzeAndHighlight(text, source = "chatbot") {
  const lowerText = text.toLowerCase();
  // Peta untuk Project Spotlight (fitur lama)
  const projectSpotlightMap = {
    flutter: "myintercom",
    toyota: "myintercom",
    intercom: "myintercom",
    laravel: "payoapp", // atau 'ppdb'
    ppdb: "ppdb",
    smakpa: "ppdb",
    "super-app": "payoapp",
    ojek: "payoapp",
  };

  for (const keyword in projectSpotlightMap) {
    if (lowerText.includes(keyword)) {
      const projectId = projectSpotlightMap[keyword];
      if (window.spotlightProject) window.spotlightProject(projectId);
      break; // Sorot hanya proyek pertama yang cocok
    }
  }

  // Peta untuk Dynamic Case Study Generator (fitur baru)
  const caseStudyKeywordMap = {
    logistik: "logistik",
    otomotif: "otomotif",
    dealer: "otomotif",
    pendidikan: "pendidikan",
    sekolah: "pendidikan",
    properti: "properti",
  };

  for (const keyword in caseStudyKeywordMap) {
    if (lowerText.includes(keyword)) {
      const topic = caseStudyKeywordMap[keyword];
      if (window.generateCaseStudy) {
        window.generateCaseStudy(topic);
        // Minimalkan jendela chat setelah studi kasus dipicu
        if (source === "chatbot" && window.actuallyCloseChatbot) {
          setTimeout(window.actuallyCloseChatbot, 300); // Tutup modal chatbot
        } else if (source === "terminal" && window.minimizeTerminal) {
          setTimeout(window.minimizeTerminal, 300); // Minimalkan terminal
        }
      }
      break; // Hasilkan hanya satu studi kasus per pesan untuk mencegah beberapa modal muncul
    }
  }
}

function typeMessage(element, text, delay = 20) {
  // The element is the outer bubble container (e.g., .ai-bubble)
  // We create the inner message structure and append it.
  const messageBubble = document.createElement("div");
  messageBubble.className = "p-3 rounded-lg max-w-[80%] chat-message";
  element.appendChild(messageBubble);

  let i = 0;
  function typing() {
    if (i < text.length) {
      messageBubble.innerHTML += text.charAt(i);
      i++;
      document.getElementById("chatDisplay").scrollTop =
        document.getElementById("chatDisplay").scrollHeight;
      setTimeout(typing, delay);
    }
  }
  typing();
}

async function sendChatMessage() {
  const chatInput = document.getElementById("chatInput");
  const chatDisplay = document.getElementById("chatDisplay");
  const message = chatInput.value.trim();
  if (!message) return;

  unlockAchievement("ai_challenger");
  const userMessageDiv = document.createElement("div");
  userMessageDiv.className = "flex justify-end mb-2 user-bubble";
  userMessageDiv.innerHTML = `<div class="p-3 rounded-lg max-w-[80%] chat-message">${message}</div>`;
  chatDisplay.appendChild(userMessageDiv);

  conversationHistory.push({ role: "user", parts: [{ text: message }] }); // Pass 'chatbot' as source
  analyzeAndHighlight(message);
  chatInput.value = "";

  const loadingDiv = document.createElement("div");
  loadingDiv.className = "flex justify-start mb-2";
  loadingDiv.innerHTML = `<div class="p-3 rounded-lg max-w-[80%] animate-pulse chat-message" style="background-color: var(--bg-card-secondary); color: var(--text-secondary);">Mengetik...</div>`;
  chatDisplay.appendChild(loadingDiv);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;

  try {
    const payload = {
      contents: conversationHistory,
      systemInstruction: { parts: [{ text: systemInstructionText }] },
    };
    const apiKey = "AIzaSyAYoqmGxZT9FwG2obC3-xpxSN6orVxi0Wk"; // Sebaiknya dipindahkan ke environment variable di sisi server
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    chatDisplay.removeChild(loadingDiv);

    if (result.candidates && result.candidates[0].content) {
      const modelResponse = result.candidates[0].content;
      let text = modelResponse.parts[0].text;

      // --- IDE BRILIAN: Analisis respons AI dan sorot keahlian yang relevan ---
      analyzeAndHighlight(text);

      const whatsappRegex = new RegExp(
        `\\[(.*?)\\]\\((${siteConfig.social.whatsapp.replace(
          "?",
          "\\?"
        )}.*?)\\)`
      );

      if (whatsappRegex.test(text)) {
        const encodedMessage = encodeURIComponent(
          `Halo Ade, saya tertarik dengan ${message}`
        );
        const waLink = `${siteConfig.social.whatsapp}?text=${encodedMessage}`;
        text = text.replace(
          whatsappRegex,
          `<a href="${waLink}" target="_blank" class="text-blue-400 hover:underline">WhatsApp</a>`
        );
      } else {
        text = text.replace(
          whatsappRegex,
          '<a href="$2" target="_blank" class="text-blue-400 hover:underline">$1</a>'
        );
      }

      const aiMessageDiv = document.createElement("div");
      aiMessageDiv.className = "flex justify-start mb-2 ai-bubble";
      chatDisplay.appendChild(aiMessageDiv);
      conversationHistory.push({ role: "model", parts: [{ text: text }] });
      typeMessage(aiMessageDiv, text);
    } else {
      throw new Error("Invalid response from API");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (chatDisplay.contains(loadingDiv)) chatDisplay.removeChild(loadingDiv);
    const errorMessageDiv = document.createElement("div");
    errorMessageDiv.className =
      "flex justify-start mb-2 ai-bubble error-bubble";
    errorMessageDiv.innerHTML = `<div class="p-3 rounded-lg max-w-[80%] chat-message">Terjadi kesalahan. Coba lagi nanti.</div>`;
    chatDisplay.appendChild(errorMessageDiv);
  } finally {
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
  }
}

function saveChatHistory() {
  localStorage.setItem("chatbotHistory", JSON.stringify(conversationHistory));
}

function deleteChatHistory() {
  localStorage.removeItem("chatbotHistory");
  conversationHistory = [];
  document.getElementById("chatDisplay").innerHTML = "";
}

function loadChatHistory() {
  const chatDisplay = document.getElementById("chatDisplay");
  const savedHistory = localStorage.getItem("chatbotHistory");
  chatDisplay.innerHTML = "";
  conversationHistory = [];
  if (savedHistory) {
    conversationHistory = JSON.parse(savedHistory);
    conversationHistory.forEach((msg) => {
      const isUser = msg.role === "user";
      const messageDiv = document.createElement("div");
      messageDiv.className = `flex ${
        isUser ? "justify-end user-bubble" : "justify-start ai-bubble"
      } mb-2`;
      messageDiv.innerHTML = `<div class="p-3 rounded-lg max-w-[80%] chat-message">${msg.parts[0].text}</div>`;
      chatDisplay.appendChild(messageDiv);
    });
  } else {
    chatDisplay.innerHTML = `<div class="flex justify-start mb-2 ai-bubble">
      <div class="p-3 rounded-lg max-w-[80%] chat-message">Halo! Ada yang bisa saya bantu?</div>
    </div>`;
  }
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

window.getTerminalChatResponse = async function (message, outputCallback) {
  if (!message) return;

  conversationHistory.push({ role: "user", parts: [{ text: message }] });
  analyzeAndHighlight(message, "terminal");

  try {
    const payload = {
      contents: conversationHistory,
      systemInstruction: { parts: [{ text: systemInstructionText }] },
    };
    const apiKey = "AIzaSyAYoqmGxZT9FwG2obC3-xpxSN6orVxi0Wk";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (result.candidates && result.candidates[0].content) {
      const modelResponse = result.candidates[0].content;
      let text = modelResponse.parts[0].text;

      // Handle WhatsApp link specifically for terminal
      const whatsappRegex = /\[(.*?)\]\((https?:\/\/wa\.me.*?)\)/g;
      text = text.replace(whatsappRegex, (match, linkText, url) => {
        const encodedMessage = encodeURIComponent(
          `Halo Ade, saya tertarik dengan ${message}`
        );
        const waLink = `${siteConfig.social.whatsapp}?text=${encodedMessage}`;
        return `${linkText} ( ${waLink} )`; // Make link visible in terminal
      });

      // Handle other markdown links
      text = text.replace(/\[(.*?)\]\((.*?)\)/g, "$1 ( $2 )");
      // Handle bold
      text = text.replace(/\*\*(.*?)\*\*/g, "$1");

      conversationHistory.push({ role: "model", parts: [{ text: text }] });
      outputCallback(text);
    } else {
      throw new Error("Invalid response from API");
    }
  } catch (error) {
    console.error("Error calling Gemini API for terminal:", error);
    outputCallback(
      "Terjadi kesalahan saat menghubungi AI. Coba lagi nanti.",
      true
    );
  }
};
